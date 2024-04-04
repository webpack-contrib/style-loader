import path from "path";

import {
  getImportInsertStyleElementCode,
  getImportInsertBySelectorCode,
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
  getInsertOptionCode,
  getStyleTagTransformFnCode,
} from "./utils";

import schema from "./options.json";

// eslint-disable-next-line consistent-return
const loader = function loader(content) {
  if (
    this._compiler &&
    this._compiler.options &&
    this._compiler.options.experiments &&
    this._compiler.options.experiments.css &&
    this._module &&
    (this._module.type === "css" ||
      this._module.type === "css/global" ||
      this._module.type === "css/module" ||
      this._module.type === "css/auto")
  ) {
    return content;
  }
};

loader.pitch = function pitch(request) {
  if (
    this._compiler &&
    this._compiler.options &&
    this._compiler.options.experiments &&
    this._compiler.options.experiments.css &&
    this._module &&
    (this._module.type === "css" ||
      this._module.type === "css/global" ||
      this._module.type === "css/module" ||
      this._module.type === "css/auto")
  ) {
    this.emitWarning(
      new Error(
        'You can\'t use `experiments.css` (`experiments.futureDefaults` enable built-in CSS support by default) and `style-loader` together, please set `experiments.css` to `false` or set `{ type: "javascript/auto" }` for rules with `style-loader` in your webpack config (now `style-loader` does nothing).',
      ),
    );
    return;
  }

  const options = this.getOptions(schema);
  const injectType = options.injectType || "styleTag";
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
        ? "module-path"
        : "selector";

  const styleTagTransformType =
    typeof options.styleTagTransform === "function"
      ? "function"
      : options.styleTagTransform && path.isAbsolute(options.styleTagTransform)
        ? "module-path"
        : "default";

  switch (injectType) {
    case "linkTag": {
      const hmrCode = this.hot ? getLinkHmrCode(esModule, this, request) : "";

      // eslint-disable-next-line consistent-return
      return `
      ${getImportLinkAPICode(esModule, this)}
      ${getImportInsertBySelectorCode(esModule, this, insertType, options)}
      ${getImportLinkContentCode(esModule, this, request)}
      ${
        esModule
          ? ""
          : `content = content.__esModule ? content.default : content;`
      }

var options = ${JSON.stringify(runtimeOptions)};

${getInsertOptionCode(insertType, options)}

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

      // eslint-disable-next-line consistent-return
      return `
      var exported = {};

      ${getImportStyleAPICode(esModule, this)}
      ${getImportStyleDomAPICode(esModule, this, isSingleton, isAuto)}
      ${getImportInsertBySelectorCode(esModule, this, insertType, options)}
      ${getSetAttributesCode(esModule, this, options)}
      ${getImportInsertStyleElementCode(esModule, this)}
      ${getStyleTagTransformFnCode(
        esModule,
        this,
        options,
        isSingleton,
        styleTagTransformType,
      )}
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

${getStyleTagTransformFn(options, isSingleton)};
options.setAttributes = setAttributes;
${getInsertOptionCode(insertType, options)}
options.domAPI = ${getdomAPI(isAuto)};
options.insertStyleElement = insertStyleElement;

exported.use = function(insertOptions) {
  options.options = insertOptions || {};

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

      // eslint-disable-next-line consistent-return
      return `
      ${getImportStyleAPICode(esModule, this)}
      ${getImportStyleDomAPICode(esModule, this, isSingleton, isAuto)}
      ${getImportInsertBySelectorCode(esModule, this, insertType, options)}
      ${getSetAttributesCode(esModule, this, options)}
      ${getImportInsertStyleElementCode(esModule, this)}
      ${getStyleTagTransformFnCode(
        esModule,
        this,
        options,
        isSingleton,
        styleTagTransformType,
      )}
      ${getImportStyleContentCode(esModule, this, request)}
      ${isAuto ? getImportIsOldIECode(esModule, this) : ""}
      ${
        esModule
          ? ""
          : `content = content.__esModule ? content.default : content;`
      }

var options = ${JSON.stringify(runtimeOptions)};

${getStyleTagTransformFn(options, isSingleton)};
options.setAttributes = setAttributes;
${getInsertOptionCode(insertType, options)}
options.domAPI = ${getdomAPI(isAuto)};
options.insertStyleElement = insertStyleElement;

var update = API(content, options);

${hmrCode}

${getExportStyleCode(esModule, this, request)}
`;
    }
  }
};

export default loader;
