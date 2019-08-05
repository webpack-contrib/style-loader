import path from 'path';

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

module.exports = () => {};

module.exports.pitch = function loader(request) {
  const options = loaderUtils.getOptions(this) || {};

  validateOptions(schema, options, {
    name: 'Style Loader',
    baseDataPath: 'options',
  });

  const insert =
    typeof options.insert === 'undefined'
      ? '"head"'
      : typeof options.insert === 'string'
      ? JSON.stringify(options.insert)
      : options.insert.toString();

  const injectType = options.injectType || 'styleTag';

  switch (injectType) {
    case 'linkTag': {
      const hmrCode = this.hot
        ? `
if (module.hot) {
  module.hot.accept(
    ${loaderUtils.stringifyRequest(this, `!!${request}`)},
    function() {
      update(require(${loaderUtils.stringifyRequest(this, `!!${request}`)}));
    }
  );

  module.hot.dispose(function() {
    update();
  });
}`
        : '';

      return `var options = ${JSON.stringify(options)};

options.insert = ${insert};

var update = require(${loaderUtils.stringifyRequest(
        this,
        `!${path.join(__dirname, 'runtime/injectStylesIntoLinkTag.js')}`
      )})(require(${loaderUtils.stringifyRequest(
        this,
        `!!${request}`
      )}), options);
${hmrCode}`;
    }

    case 'lazyStyleTag':
    case 'lazySingletonStyleTag': {
      const isSingleton = injectType === 'lazySingletonStyleTag';

      const hmrCode = this.hot
        ? `
if (module.hot) {
  var lastRefs = module.hot.data && module.hot.data.refs || 0;
  
  if (lastRefs) {
    exports.use();

    if (!content.locals) {
      refs = lastRefs;
    }
  }

  if (!content.locals) {
    module.hot.accept();
  }

  module.hot.dispose(function(data) {
    data.refs = content.locals ? 0 : refs;

    if (dispose) {
      dispose();
    }
  });
}`
        : '';

      return `var refs = 0;
var dispose;
var content = require(${loaderUtils.stringifyRequest(this, `!!${request}`)});
var options = ${JSON.stringify(options)};

options.insert = ${insert};
options.singleton = ${isSingleton};

if (typeof content === 'string') {
  content = [[module.id, content, '']];
}

if (content.locals) {
  exports.locals = content.locals;
}

exports.use = function() {
  if (!(refs++)) {
    dispose = require(${loaderUtils.stringifyRequest(
      this,
      `!${path.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`
    )})(content, options);
  }

 return exports;
};

exports.unuse = function() {
  if (refs > 0 && !--refs) {
    dispose();
    dispose = null;
  }
};
${hmrCode}
`;
    }

    case 'styleTag':
    case 'singletonStyleTag':
    default: {
      const isSingleton = injectType === 'singletonStyleTag';

      const hmrCode = this.hot
        ? `
if (module.hot) {
  if (!content.locals) {
    module.hot.accept(
      ${loaderUtils.stringifyRequest(this, `!!${request}`)},
      function () {
        var newContent = require(${loaderUtils.stringifyRequest(
          this,
          `!!${request}`
        )});

        if (typeof newContent === 'string') {
          newContent = [[module.id, newContent, '']];
        }
        
        update(newContent);
      }
    )
  }

  module.hot.dispose(function() { 
    update();
  });
}`
        : '';

      return `var content = require(${loaderUtils.stringifyRequest(
        this,
        `!!${request}`
      )});

if (typeof content === 'string') {
  content = [[module.id, content, '']];
}

var options = ${JSON.stringify(options)}

options.insert = ${insert};
options.singleton = ${isSingleton};

var update = require(${loaderUtils.stringifyRequest(
        this,
        `!${path.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`
      )})(content, options);

if (content.locals) {
  module.exports = content.locals;
}
${hmrCode}`;
    }
  }
};
