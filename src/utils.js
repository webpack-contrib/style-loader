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

function getImportLinkAPICode(esModule, loaderContext) {
  const modulePath = stringifyRequest(
    loaderContext,
    `!${path.join(__dirname, "runtime/injectStylesIntoLinkTag.js")}`
  );

  return esModule
    ? `import API from ${modulePath};`
    : `var API = require(${modulePath});`;
}

function getImportLinkContentCode(esModule, loaderContext, request) {
  const modulePath = stringifyRequest(loaderContext, `!!${request}`);

  return esModule
    ? `import content from ${modulePath};`
    : `var content = require(${modulePath});`;
}

function getImportStyleAPICode(esModule, loaderContext) {
  const modulePath = stringifyRequest(
    loaderContext,
    `!${path.join(__dirname, "runtime/injectStylesIntoStyleTag.js")}`
  );

  return esModule
    ? `import API from ${modulePath};`
    : `var API = require(${modulePath});`;
}

function getImportStyleDomAPICode(
  esModule,
  loaderContext,
  isSingleton,
  isAuto
) {
  const styleAPI = stringifyRequest(
    loaderContext,
    `!${path.join(__dirname, "runtime/styleDomAPI.js")}`
  );
  const singletonAPI = stringifyRequest(
    loaderContext,
    `!${path.join(__dirname, "runtime/singletonStyleDomAPI.js")}`
  );

  if (isAuto) {
    return esModule
      ? `import domAPI from ${styleAPI};
        import domAPISingleton from ${singletonAPI};`
      : `var domAPI = require(${styleAPI});
        var domAPISingleton = require(${singletonAPI});`;
  }

  return esModule
    ? `import domAPI from ${isSingleton ? singletonAPI : styleAPI};`
    : `var domAPI = require(${isSingleton ? singletonAPI : styleAPI});`;
}

function getImportStyleContentCode(esModule, loaderContext, request) {
  const modulePath = stringifyRequest(loaderContext, `!!${request}`);

  return esModule
    ? `import content, * as namedExport from ${modulePath};`
    : `var content = require(${modulePath});`;
}

function getImportGetTargetCode(esModule, loaderContext, insertIsFunction) {
  const modulePath = stringifyRequest(
    loaderContext,
    `!${path.join(__dirname, "runtime/getTarget.js")}`
  );

  return esModule
    ? `${!insertIsFunction ? `import getTarget from ${modulePath};` : ""}`
    : `${!insertIsFunction ? `var getTarget = require(${modulePath});` : ""}`;
}

function getImportInsertStyleElementCode(esModule, loaderContext) {
  const modulePath = stringifyRequest(
    loaderContext,
    `!${path.join(__dirname, "runtime/insertStyleElement.js")}`
  );

  return esModule
    ? `import insertStyleElement from ${modulePath};`
    : `var insertStyleElement = require(${modulePath});`;
}

function getStyleHmrCode(esModule, loaderContext, request, lazy) {
  const modulePath = stringifyRequest(loaderContext, `!!${request}`);

  return `
if (module.hot) {
  if (!content.locals || module.hot.invalidate) {
    var isEqualLocals = ${isEqualLocals.toString()};
    var isNamedExport = ${esModule ? "!content.locals" : false};
    var oldLocals = isNamedExport ? namedExport : content.locals;

    module.hot.accept(
      ${modulePath},
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
            : `content = require(${modulePath});

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

function getLinkHmrCode(esModule, loaderContext, request) {
  const modulePath = stringifyRequest(loaderContext, `!!${request}`);

  return `
if (module.hot) {
  module.hot.accept(
    ${modulePath},
    function() {
     ${
       esModule
         ? "update(content);"
         : `content = require(${modulePath});

           content = content.__esModule ? content.default : content;

           update(content);`
     }
    }
  );

  module.hot.dispose(function() {
    update();
  });
}`;
}

function getdomAPI(isAuto) {
  return isAuto ? "isOldIE() ? domAPISingleton : domAPI" : "domAPI";
}

function getImportIsOldIECode(esModule, loaderContext) {
  const modulePath = stringifyRequest(
    loaderContext,
    `!${path.join(__dirname, "runtime/isOldIE.js")}`
  );

  return esModule
    ? `import isOldIE from ${modulePath};`
    : `var isOldIE = require(${modulePath});`;
}

function getStyleTagTransformFn(styleTagTransformFn, isSingleton) {
  return isSingleton
    ? ""
    : `options.styleTagTransform = ${styleTagTransformFn}`;
}

function getExportStyleCode(esModule, loaderContext, request) {
  const modulePath = stringifyRequest(loaderContext, `!!${request}`);

  return esModule
    ? `export * from ${modulePath};
       export default content && content.locals ? content.locals : undefined;`
    : "module.exports = content && content.locals || {};";
}

function getExportLazyStyleCode(esModule, loaderContext, request) {
  const modulePath = stringifyRequest(loaderContext, `!!${request}`);

  return esModule
    ? `export * from ${modulePath};
       export default exported;`
    : "module.exports = exported;";
}

function getSetAttributesCode(esModule, loaderContext, options) {
  let modulePath;

  if (typeof options.attributes !== "undefined") {
    modulePath =
      options.attributes.nonce !== "undefined"
        ? stringifyRequest(
            loaderContext,
            `!${path.join(
              __dirname,
              "runtime/setAttributesWithAttributesAndNonce.js"
            )}`
          )
        : stringifyRequest(
            loaderContext,
            `!${path.join(__dirname, "runtime/setAttributesWithAttributes.js")}`
          );
  } else {
    modulePath = stringifyRequest(
      loaderContext,
      `!${path.join(__dirname, "runtime/setAttributesWithoutAttributes.js")}`
    );
  }

  return esModule
    ? `import setAttributes from ${modulePath};`
    : `var setAttributes = require(${modulePath});`;
}

// eslint-disable-next-line import/prefer-default-export
export {
  stringifyRequest,
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
};
