import path from "path";

import { stringifyRequest } from "./utils";

import isEqualLocals from "./runtime/isEqualLocals";

import schema from "./options.json";

const loaderApi = () => {};

// TODO add var isOldIE = isOldIEFn(); for autoApi

loaderApi.pitch = function loader(request) {
  const options = this.getOptions(schema);
  const insert =
    typeof options.insert === "string"
      ? JSON.stringify(options.insert)
      : '"head"';
  const insertIsFunction = typeof options.insert === "function";
  const injectType = options.injectType || "styleTag";
  const esModule =
    typeof options.esModule !== "undefined" ? options.esModule : true;
  const runtimeOptions = {
    injectType: options.injectType,
    attributes: options.attributes,
    insert: options.insert,
    base: options.base,
  };
  const insertFn = insertIsFunction
    ? options.insert.toString()
    : `function(style){
    const target = getTarget(${insert});

    if (!target) {
      throw new Error(
        "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
      );
    }

    target.appendChild(style);
  }`;

  switch (injectType) {
    case "linkTag": {
      const hmrCode = this.hot
        ? `
if (module.hot) {
  module.hot.accept(
    ${stringifyRequest(this, `!!${request}`)},
    function() {
     ${
       esModule
         ? "update(content);"
         : `content = require(${stringifyRequest(this, `!!${request}`)});

           content = content.__esModule ? content.default : content;

           update(content);`
     }
    }
  );

  module.hot.dispose(function() {
    update();
  });
}`
        : "";

      return `${
        esModule
          ? `import api from ${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/injectStylesIntoLinkTag.js")}`
            )};
            import content from ${stringifyRequest(this, `!!${request}`)};
            ${
              !insertIsFunction
                ? `import getTarget from ${stringifyRequest(
                    this,
                    `!${path.join(__dirname, "runtime/getTarget.js")}`
                  )};`
                : ""
            }`
          : `var api = require(${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/injectStylesIntoLinkTag.js")}`
            )});
            ${
              !insertIsFunction
                ? `var getTarget = require(${stringifyRequest(
                    this,
                    `!${path.join(__dirname, "runtime/getTarget.js")}`
                  )});`
                : ""
            }
            var content = require(${stringifyRequest(this, `!!${request}`)});

            content = content.__esModule ? content.default : content;`
      }

var options = ${JSON.stringify(runtimeOptions)};

options.insert = ${insertFn};

var update = api(content, options);

${hmrCode}

${esModule ? "export default {}" : ""}`;
    }

    case "lazyStyleTag":
    case "lazySingletonStyleTag": {
      const isSingleton = injectType === "lazySingletonStyleTag";

      const hmrCode = this.hot
        ? `
if (module.hot) {
  if (!content.locals || module.hot.invalidate) {
    var isEqualLocals = ${isEqualLocals.toString()};
    var isNamedExport = ${esModule ? "!('locals' in content)" : false};
    var oldLocals = isNamedExport ? namedExport : content.locals;

    module.hot.accept(
      ${stringifyRequest(this, `!!${request}`)},
      function () {
        ${
          esModule
            ? `if (!isEqualLocals(oldLocals, isNamedExport ? namedExport : content.locals, isNamedExport)) {
                module.hot.invalidate();

                return;
              }

              oldLocals = isNamedExport ? namedExport : content.locals;

              if (update && refs > 0) {
                update(content);
              }`
            : `content = require(${stringifyRequest(this, `!!${request}`)});

              content = content.__esModule ? content.default : content;

              if (!isEqualLocals(oldLocals, content.locals)) {
                module.hot.invalidate();

                return;
              }

              oldLocals = content.locals;

              if (update && refs > 0) {
                update(content);
              }`
        }
      }
    )
  }

  module.hot.dispose(function() {
    if (update) {
      update();
    }
  });
}`
        : "";

      return `
      var exported = {};
      ${
        esModule
          ? `import api from ${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/injectStylesIntoStyleTag.js")}`
            )};
            import domApi from ${stringifyRequest(
              this,
              `!${path.join(
                __dirname,
                `runtime/${isSingleton ? "singletonStyleApi" : "styleApi"}.js`
              )}`
            )};
            import getTarget from ${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/getTarget.js")}`
            )};
            import insertStyleElement from ${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/insertStyleElement.js")}`
            )};


            import content, * as namedExport from ${stringifyRequest(
              this,
              `!!${request}`
            )};

            if (content && content.locals) {
              exported.locals = content.locals;
            }
            `
          : `var api = require(${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/injectStylesIntoStyleTag.js")}`
            )});
            var domApi = require(${stringifyRequest(
              this,
              `!${path.join(
                __dirname,
                `runtime/${isSingleton ? "singletonStyleApi" : "styleApi"}.js`
              )}`
            )});
            var insertStyleElement = require(${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/insertStyleElement.js")}`
            )});
            var getTarget = require(${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/getTarget.js")}`
            )});
            var content = require(${stringifyRequest(this, `!!${request}`)});

            content = content.__esModule ? content.default : content;

            exported.locals = content.locals || {};
            `
      }

var refs = 0;
var update;
var options = ${JSON.stringify(runtimeOptions)};

options.insert = ${insertFn};
options.domApi = domApi;
options.insertStyleElement = insertStyleElement;

exported.use = function() {
  if (!(refs++)) {
    update = api(content, options);
  }

  return exported;
};
exported.unuse = function() {
  if (refs > 0 && !--refs) {
    update();
    update = null;
  }
};

${hmrCode}

${
  esModule
    ? `export * from ${stringifyRequest(this, `!!${request}`)};
       export default exported;`
    : "module.exports = exported;"
}
`;
    }

    case "styleTag":
    case "singletonStyleTag":
    default: {
      const isSingleton = injectType === "singletonStyleTag";

      const hmrCode = this.hot
        ? `
if (module.hot) {
  if (!content.locals || module.hot.invalidate) {
    var isEqualLocals = ${isEqualLocals.toString()};
    var isNamedExport = ${esModule ? "!content.locals" : false};
    var oldLocals = isNamedExport ? namedExport : content.locals;

    module.hot.accept(
      ${stringifyRequest(this, `!!${request}`)},
      function () {
        ${
          esModule
            ? `if (!isEqualLocals(oldLocals, isNamedExport ? namedExport : content.locals, isNamedExport)) {
                module.hot.invalidate();

                return;
              }

              oldLocals = isNamedExport ? namedExport : content.locals;

              update(content);`
            : `content = require(${stringifyRequest(this, `!!${request}`)});

              content = content.__esModule ? content.default : content;

              if (typeof content === 'string') {
                content = [[module.id, content, '']];
              }

              if (!isEqualLocals(oldLocals, content.locals)) {
                module.hot.invalidate();

                return;
              }

              oldLocals = content.locals;

              update(content);`
        }
      }
    )
  }

  module.hot.dispose(function() {
    update();
  });
}`
        : "";

      return `
      ${
        esModule
          ? `import api from ${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/injectStylesIntoStyleTag.js")}`
            )};
            import domApi from ${stringifyRequest(
              this,
              `!${path.join(
                __dirname,
                `runtime/${isSingleton ? "singletonStyleApi" : "styleApi"}.js`
              )}`
            )};
            import insertStyleElement from ${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/insertStyleElement.js")}`
            )};
            import getTarget from ${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/getTarget.js")}`
            )};
            import content, * as namedExport from ${stringifyRequest(
              this,
              `!!${request}`
            )};`
          : `var api = require(${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/injectStylesIntoStyleTag.js")}`
            )});
            var domApi = require(${stringifyRequest(
              this,
              `!${path.join(
                __dirname,
                `runtime/${isSingleton ? "singletonStyleApi" : "styleApi"}.js`
              )}`
            )});
            var insertStyleElement = require(${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/insertStyleElement.js")}`
            )});
            var getTarget = require(${stringifyRequest(
              this,
              `!${path.join(__dirname, "runtime/getTarget.js")}`
            )});

            var content = require(${stringifyRequest(this, `!!${request}`)});

            content = content.__esModule ? content.default : content;`
      }

var options = ${JSON.stringify(runtimeOptions)};

options.insert = ${insertFn};
options.domApi = domApi;
options.insertStyleElement = insertStyleElement;

var update = api(content, options);

${hmrCode}

${
  esModule
    ? `export * from ${stringifyRequest(this, `!!${request}`)};
       export default content && content.locals ? content.locals : undefined;`
    : "module.exports = content && content.locals || {};"
}`;
    }
  }
};

export default loaderApi;
