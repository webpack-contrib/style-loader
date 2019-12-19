import path from 'path';

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

const loaderApi = () => {};

loaderApi.pitch = function loader(request) {
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
  const esModule =
    typeof options.esModule !== 'undefined' ? options.esModule : false;

  delete options.esModule;

  switch (injectType) {
    case 'linkTag': {
      const hmrCode = this.hot
        ? `
if (module.hot) {
  module.hot.accept(
    ${loaderUtils.stringifyRequest(this, `!!${request}`)},
    function() {
     ${
       esModule
         ? `update(content);`
         : `var newContent = require(${loaderUtils.stringifyRequest(
             this,
             `!!${request}`
           )});

           newContent = newContent.__esModule ? newContent.default : newContent;

           update(newContent);`
     }
    }
  );

  module.hot.dispose(function() {
    update();
  });
}`
        : '';

      return `${
        esModule
          ? `import api from ${loaderUtils.stringifyRequest(
              this,
              `!${path.join(__dirname, 'runtime/injectStylesIntoLinkTag.js')}`
            )};
            import content from ${loaderUtils.stringifyRequest(
              this,
              `!!${request}`
            )};`
          : `var api = require(${loaderUtils.stringifyRequest(
              this,
              `!${path.join(__dirname, 'runtime/injectStylesIntoLinkTag.js')}`
            )});
            var content = require(${loaderUtils.stringifyRequest(
              this,
              `!!${request}`
            )});

            content = content.__esModule ? content.default : content;`
      }

var options = ${JSON.stringify(options)};

options.insert = ${insert};

var update = api(content, options);

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
    exported.use();

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

      return `${
        esModule
          ? `import api from ${loaderUtils.stringifyRequest(
              this,
              `!${path.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`
            )};
            import content from ${loaderUtils.stringifyRequest(
              this,
              `!!${request}`
            )};`
          : `var api = require(${loaderUtils.stringifyRequest(
              this,
              `!${path.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`
            )});
            var content = require(${loaderUtils.stringifyRequest(
              this,
              `!!${request}`
            )});

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.id, content, '']];
            }`
      }

var refs = 0;
var dispose;
var options = ${JSON.stringify(options)};

options.insert = ${insert};
options.singleton = ${isSingleton};

var exported = {};

if (content.locals) {
  exported.locals = content.locals;
}

exported.use = function() {
  if (!(refs++)) {
    dispose = api(content, options);
  }

  return exported;
};

exported.unuse = function() {
  if (refs > 0 && !--refs) {
    dispose();
    dispose = null;
  }
};

${esModule ? 'export default' : 'module.exports ='} exported;

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
        ${
          esModule
            ? `update(content);`
            : `var newContent = require(${loaderUtils.stringifyRequest(
                this,
                `!!${request}`
              )});

              newContent = newContent.__esModule ? newContent.default : newContent;

              if (typeof newContent === 'string') {
                newContent = [[module.id, newContent, '']];
              }

              update(newContent);`
        }
      }
    )
  }

  module.hot.dispose(function() { 
    update();
  });
}`
        : '';

      return `${
        esModule
          ? `import api from ${loaderUtils.stringifyRequest(
              this,
              `!${path.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`
            )};
            import content from ${loaderUtils.stringifyRequest(
              this,
              `!!${request}`
            )};
            var clonedContent = content;`
          : `var api = require(${loaderUtils.stringifyRequest(
              this,
              `!${path.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`
            )});
            var content = require(${loaderUtils.stringifyRequest(
              this,
              `!!${request}`
            )});

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.id, content, '']];
            }`
      }

var options = ${JSON.stringify(options)};

options.insert = ${insert};
options.singleton = ${isSingleton};

var update = api(content, options);

var exported = content.locals ? content.locals : {};

${esModule ? 'export default' : 'module.exports ='} exported;

${hmrCode}`;
    }
  }
};

export default loaderApi;
