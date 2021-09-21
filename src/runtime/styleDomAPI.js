/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  let css = "";

  if (obj.supports) {
    css += `@supports (${obj.supports}) {`;
  }

  if (obj.media) {
    css += `@media ${obj.media} {`;
  }

  const needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += `@layer${obj.layer.length > 0 ? ` ${obj.layer}` : ""} {`;
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  const sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += `\n/*# sourceMappingURL=data:application/json;base64,${btoa(
      unescape(encodeURIComponent(JSON.stringify(sourceMap)))
    )} */`;
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  const styleElement = options.insertStyleElement(options);

  return {
    update: (obj) => {
      apply(styleElement, options, obj);
    },
    remove: () => {
      removeStyleElement(styleElement);
    },
  };
}

module.exports = domAPI;
