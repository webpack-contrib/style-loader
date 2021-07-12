import path from "path";

import {
  getImportInsertStyleElementCode,
  getImportGetTargetCode,
  getImportStyleContentCode,
  getImportStyleDomAPICode,
  getImportStyleAPICode,
  getImportLinkContentCode,
  getImportLinkAPICode,
  getStyleHmrCode,
  getLinkHmrCode,
  getdomAPI,
  getImportIsOldIECode,
  getStyleTagTransformFn,
  getExportStyleCode,
  getExportLazyStyleCode,
  getSetAttributesCode,
} from "./utils";

import schema from "./options.json";

const loaderAPI = () => {};

loaderAPI.pitch = function loader(request) {
  const options = this.getOptions(schema);
  const insert =
    typeof options.insert === "string"
      ? JSON.stringify(options.insert)
      : '"head"';
  const injectType = options.injectType || "styleTag";
  const { styleTagTransform } = options;
  const esModule =
    typeof options.esModule !== "undefined" ? options.esModule : true;
  const runtimeOptions = {};

  if (options.attributes) {
    runtimeOptions.attributes = options.attributes;
  }

  if (options.base) {
    runtimeOptions.base = options.base;
  }

  const insertType =
    typeof options.insert === "function"
      ? "function"
      : options.insert && path.isAbsolute(options.insert)
      ? "modulePath"
      : "selector";

  let insertFn;

  if (insertType === "function") {
    insertFn = options.insert.toString();
  } else if (insertType === "selector") {
    insertFn = `function(style){
      var target = getTarget(${insert});

      if (!target) {
        throw new Error(
          "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
        );
      }

      target.appendChild(style);
    }`;
  }

  const styleTagTransformFn =
    typeof styleTagTransform === "function"
      ? styleTagTransform.toString()
      : `function(css, style){
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
      while (style.firstChild) {
        style.removeChild(style.firstChild);
      }

      style.appendChild(document.createTextNode(css));
    }
  }`;

  switch (injectType) {
    case "linkTag": {
      const hmrCode = this.hot ? getLinkHmrCode(esModule, this, request) : "";

      return `
      ${getImportLinkAPICode(esModule, this)}
      ${getImportGetTargetCode(esModule, this, insertType, options)}
      ${getImportLinkContentCode(esModule, this, request)}
      ${
        esModule
          ? ""
          : `content = content.__esModule ? content.default : content;`
      }

var options = ${JSON.stringify(runtimeOptions)};

options.insert = ${insertType === "modulePath" ? "insertFn" : insertFn};

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
        ? getStyleHmrCode(esModule, this, request, true)
        : "";

      return `
      var exported = {};

      ${getImportStyleAPICode(esModule, this)}
      ${getImportStyleDomAPICode(esModule, this, isSingleton, isAuto)}
      ${getImportGetTargetCode(esModule, this, insertType, options)}
      ${getSetAttributesCode(esModule, this, options)}
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

${getStyleTagTransformFn(styleTagTransformFn, isSingleton)};
options.setAttributes = setAttributes;
options.insert = ${insertType === "modulePath" ? "insertFn" : insertFn};
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

${getExportLazyStyleCode(esModule, this, request)}
`;
    }

    case "styleTag":
    case "autoStyleTag":
    case "singletonStyleTag":
    default: {
      const isSingleton = injectType === "singletonStyleTag";
      const isAuto = injectType === "autoStyleTag";
      const hmrCode = this.hot
        ? getStyleHmrCode(esModule, this, request, false)
        : "";

      return `
      ${getImportStyleAPICode(esModule, this)}
      ${getImportStyleDomAPICode(esModule, this, isSingleton, isAuto)}
      ${getImportGetTargetCode(esModule, this, insertType, options)}
      ${getSetAttributesCode(esModule, this, options)}
      ${getImportInsertStyleElementCode(esModule, this)}
      ${getImportStyleContentCode(esModule, this, request)}
      ${isAuto ? getImportIsOldIECode(esModule, this) : ""}
      ${
        esModule
          ? ""
          : `content = content.__esModule ? content.default : content;`
      }

var options = ${JSON.stringify(runtimeOptions)};

${getStyleTagTransformFn(styleTagTransformFn, isSingleton)};
options.setAttributes = setAttributes;
options.insert = ${insertType === "modulePath" ? "insertFn" : insertFn};
options.domAPI = ${getdomAPI(isAuto)};
options.insertStyleElement = insertStyleElement;

var update = API(content, options);

${hmrCode}

${getExportStyleCode(esModule, this, request)}
`;
    }
  }
};

export default loaderAPI;
