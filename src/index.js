import {
  stringifyRequest,
  getImportInsertStyleElementCode,
  getImportGetTargetCode,
  getImportStyleContentCode,
  getImportStyleDomAPICode,
  getImportStyleAPICode,
  getImportLinkContentCode,
  getImportLinkAPICode,
  getStyleHmrCode,
  getdomAPI,
  getImportIsOldIECode,
} from "./utils";

import schema from "./options.json";

const loaderAPI = () => {};

loaderAPI.pitch = function loader(request) {
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
    var target = getTarget(${insert});

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

      return `
      ${getImportLinkAPICode(esModule, this)}
      ${getImportGetTargetCode(esModule, this, insertIsFunction)}
      ${getImportLinkContentCode(esModule, this, request)}
      ${
        esModule
          ? ""
          : `content = content.__esModule ? content.default : content;`
      }

var options = ${JSON.stringify(runtimeOptions)};

options.insert = ${insertFn};

var update = API(content, options);

${hmrCode}

${esModule ? "export default {}" : ""}`;
    }

    case "lazyStyleTag":
    case "lazyAutoStyleTag":
    case "lazySingletonStyleTag": {
      const isSingleton = injectType === "lazySingletonStyleTag";
      const isAuto = injectType === "lazyAutoStyleTag";
      const hmrCode = this.hot
        ? `${getStyleHmrCode(esModule, this, request, true)}`
        : "";

      return `
      var exported = {};

      ${getImportStyleAPICode(esModule, this)}
      ${getImportStyleDomAPICode(esModule, this, isSingleton, isAuto)}
      ${getImportGetTargetCode(esModule, this, insertIsFunction)}
      ${getImportInsertStyleElementCode(esModule, this)}
      ${getImportStyleContentCode(esModule, this, request)}
      ${isAuto ? getImportIsOldIECode(esModule, this) : ""}
      ${
        esModule
          ? `if (content && content.locals) {
              exported.locals = content.locals;
            }
            `
          : `content = content.__esModule ? content.default : content;

            exported.locals = content.locals || {};`
      }

var refs = 0;
var update;
var options = ${JSON.stringify(runtimeOptions)};

options.insert = ${insertFn};
options.domAPI = ${getdomAPI(isAuto)};
options.insertStyleElement = insertStyleElement;

exported.use = function() {
  if (!(refs++)) {
    update = API(content, options);
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
    case "autoStyleTag":
    case "singletonStyleTag":
    default: {
      const isSingleton = injectType === "singletonStyleTag";
      const isAuto = injectType === "autoStyleTag";
      const hmrCode = this.hot
        ? `${getStyleHmrCode(esModule, this, request, false)}`
        : "";

      return `
      ${getImportStyleAPICode(esModule, this)}
      ${getImportStyleDomAPICode(esModule, this, isSingleton, isAuto)}
      ${getImportGetTargetCode(esModule, this, insertIsFunction)}
      ${getImportInsertStyleElementCode(esModule, this)}
      ${getImportStyleContentCode(esModule, this, request)}
      ${isAuto ? getImportIsOldIECode(esModule, this) : ""}
      ${
        esModule
          ? ""
          : `content = content.__esModule ? content.default : content;`
      }

var options = ${JSON.stringify(runtimeOptions)};

options.insert = ${insertFn};
options.domAPI = ${getdomAPI(isAuto)};
options.insertStyleElement = insertStyleElement;

var update = API(content, options);

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

export default loaderAPI;
