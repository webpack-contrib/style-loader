import path from "path";

import isEqualLocals from "./runtime/isEqualLocals";

const matchRelativePath = /^\.\.?[/\\]/;

function isAbsolutePath(str) {
  return path.posix.isAbsolute(str) || path.win32.isAbsolute(str);
}

function isRelativePath(str) {
  return matchRelativePath.test(str);
}

function stringifyRequest(loaderContext, request) {
  const splitted = request.split("!");
  const { context } = loaderContext;

  return JSON.stringify(
    splitted
      .map((part) => {
        // First, separate singlePath from query, because the query might contain paths again
        const splittedPart = part.match(/^(.*?)(\?.*)/);
        const query = splittedPart ? splittedPart[2] : "";
        let singlePath = splittedPart ? splittedPart[1] : part;

        if (isAbsolutePath(singlePath) && context) {
          singlePath = path.relative(context, singlePath);

          if (isAbsolutePath(singlePath)) {
            // If singlePath still matches an absolute path, singlePath was on a different drive than context.
            // In this case, we leave the path platform-specific without replacing any separators.
            // @see https://github.com/webpack/loader-utils/pull/14
            return singlePath + query;
          }

          if (isRelativePath(singlePath) === false) {
            // Ensure that the relative path starts at least with ./ otherwise it would be a request into the modules directory (like node_modules).
            singlePath = `./${singlePath}`;
          }
        }

        return singlePath.replace(/\\/g, "/") + query;
      })
      .join("!")
  );
}

function getImportLinkApiCode(esModule, loaderContext) {
  return esModule
    ? `import api from ${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/injectStylesIntoLinkTag.js")}`
      )};`
    : `var api = require(${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/injectStylesIntoLinkTag.js")}`
      )});`;
}

function getImportLinkContentCode(esModule, loaderContext, request) {
  return esModule
    ? `import content from ${stringifyRequest(loaderContext, `!!${request}`)};`
    : `var content = require(${stringifyRequest(
        loaderContext,
        `!!${request}`
      )});`;
}

function getImportStyleApiCode(esModule, loaderContext) {
  return esModule
    ? `import api from ${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/injectStylesIntoStyleTag.js")}`
      )};`
    : `var api = require(${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/injectStylesIntoStyleTag.js")}`
      )});`;
}

function getImportStyleDomApiCode(esModule, loaderContext, isSingleton) {
  return esModule
    ? `import domApi from ${stringifyRequest(
        loaderContext,
        `!${path.join(
          __dirname,
          `runtime/${isSingleton ? "singletonStyleApi" : "styleApi"}.js`
        )}`
      )};`
    : `var domApi = require(${stringifyRequest(
        loaderContext,
        `!${path.join(
          __dirname,
          `runtime/${isSingleton ? "singletonStyleApi" : "styleApi"}.js`
        )}`
      )});`;
}

function getImportStyleContentCode(esModule, loaderContext, request) {
  return esModule
    ? `import content, * as namedExport from ${stringifyRequest(
        loaderContext,
        `!!${request}`
      )};`
    : `var content = require(${stringifyRequest(
        loaderContext,
        `!!${request}`
      )});`;
}

function getImportGetTargetCode(esModule, loaderContext, insertIsFunction) {
  return esModule
    ? `${
        !insertIsFunction
          ? `import getTarget from ${stringifyRequest(
              loaderContext,
              `!${path.join(__dirname, "runtime/getTarget.js")}`
            )};`
          : ""
      }`
    : `${
        !insertIsFunction
          ? `var getTarget = require(${stringifyRequest(
              loaderContext,
              `!${path.join(__dirname, "runtime/getTarget.js")}`
            )});`
          : ""
      }`;
}

function getImportInsertStyleElementCode(esModule, loaderContext) {
  return esModule
    ? `import insertStyleElement from ${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/insertStyleElement.js")}`
      )};`
    : `var insertStyleElement = require(${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/insertStyleElement.js")}`
      )});`;
}

function getStyleHmrCode(esModule, loaderContext, request, lazy) {
  return `
        if (module.hot) {
          if (!content.locals || module.hot.invalidate) {
            var isEqualLocals = ${isEqualLocals.toString()};
            var isNamedExport = ${esModule ? "!content.locals" : false};
            var oldLocals = isNamedExport ? namedExport : content.locals;

            module.hot.accept(
              ${stringifyRequest(loaderContext, `!!${request}`)},
              function () {
                ${
                  esModule
                    ? `if (!isEqualLocals(oldLocals, isNamedExport ? namedExport : content.locals, isNamedExport)) {
                        module.hot.invalidate();

                        return;
                      }

                      oldLocals = isNamedExport ? namedExport : content.locals;

                      ${
                        lazy
                          ? `if (update && refs > 0) {
                              update(content);
                            }`
                          : `update(content);`
                      }`
                    : `content = require(${stringifyRequest(
                        loaderContext,
                        `!!${request}`
                      )});

                      content = content.__esModule ? content.default : content;

                      ${
                        lazy
                          ? ""
                          : `if (typeof content === 'string') {
                              content = [[module.id, content, '']];
                            }`
                      }

                      if (!isEqualLocals(oldLocals, content.locals)) {
                        module.hot.invalidate();

                        return;
                      }

                      oldLocals = content.locals;

                      ${
                        lazy
                          ? `if (update && refs > 0) {
                                update(content);
                              }`
                          : `update(content);`
                      }`
                }
              }
            )
          }

          module.hot.dispose(function() {
            ${
              lazy
                ? `if (update) {
                    update();
                  }`
                : `update();`
            }
          });
        }
        `;
}

function getImportStyleAllDomApiCode(esModule, loaderContext) {
  return esModule
    ? `import domApi from ${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/styleApi.js")}`
      )};
        import domApiSingleton from ${stringifyRequest(
          loaderContext,
          `!${path.join(__dirname, "runtime/singletonStyleApi.js")}`
        )};`
    : `var domApi = require(${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/styleApi.js")}`
      )});
        var domApiSingleton = require(${stringifyRequest(
          loaderContext,
          `!${path.join(__dirname, "runtime/singletonStyleApi.js")}`
        )});`;
}

function getDomApi(isAuto) {
  return isAuto ? "isOldIE() ? domApiSingleton : domApi" : "domApi";
}

function getImportIsOldIECode(esModule, loaderContext) {
  return esModule
    ? `import isOldIEFn from ${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/isOldIE.js")}`
      )};`
    : `var isOldIEFn = require(${stringifyRequest(
        loaderContext,
        `!${path.join(__dirname, "runtime/isOldIE.js")}`
      )});`;
}

// eslint-disable-next-line import/prefer-default-export
export {
  stringifyRequest,
  getImportInsertStyleElementCode,
  getImportGetTargetCode,
  getImportStyleContentCode,
  getImportStyleDomApiCode,
  getImportStyleApiCode,
  getImportLinkContentCode,
  getImportLinkApiCode,
  getStyleHmrCode,
  getImportStyleAllDomApiCode,
  getDomApi,
  getImportIsOldIECode,
};
