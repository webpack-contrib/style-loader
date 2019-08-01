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

  // The variable is needed, because the function should be inlined.
  // If is just stored it in options, JSON.stringify will quote
  // the function and it would be just a string at runtime
  let insertInto;

  if (typeof options.insertInto === 'function') {
    insertInto = options.insertInto.toString();
  }

  // We need to check if it a string, or variable will be "undefined"
  // and the loader crashes
  if (typeof options.insertInto === 'string') {
    insertInto = `"${options.insertInto}"`;
  }

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

      return `var update = require(${loaderUtils.stringifyRequest(
        this,
        `!${path.join(__dirname, 'runtime/injectStylesIntoLinkTag.js')}`
      )})(require(${loaderUtils.stringifyRequest(
        this,
        `!!${request}`
      )}), ${JSON.stringify(options)});
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
    exports.ref();
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

options.insertInto = ${insertInto};
options.singleton = ${isSingleton};

if (typeof content === 'string') content = [[module.id, content, '']];
if (content.locals) exports.locals = content.locals;

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
  module.hot.accept(
    ${loaderUtils.stringifyRequest(this, `!!${request}`)},
    function() {
      var newContent = require(${loaderUtils.stringifyRequest(
        this,
        `!!${request}`
      )});

      if (typeof newContent === 'string')
        newContent = [[module.id, newContent, '']];

      var locals = (function(a, b) {
        var key,
          idx = 0;

        for (key in a) {
          if(!b || a[key] !== b[key]) return false;
          idx++;
        }

        for (key in b) idx--;

        return idx === 0;
      }(content.locals, newContent.locals));

      if (!locals)
        throw new Error('Aborting CSS HMR due to changed css-modules locals.');

      update(newContent);
    }
  );

  module.hot.dispose(function() { 
    update();
  });
}`
        : '';

      return `var content = require(${loaderUtils.stringifyRequest(
        this,
        `!!${request}`
      )});

if (typeof content === 'string') content = [[module.id, content, '']];

var insertInto;

var options = ${JSON.stringify(options)}

options.insertInto = ${insertInto};
options.singleton = ${isSingleton};

var update = require(${loaderUtils.stringifyRequest(
        this,
        `!${path.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`
      )})(content, options);

if (content.locals) module.exports = content.locals;
${hmrCode}`;
    }
  }
};
