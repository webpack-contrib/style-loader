/* istanbul ignore next  */
function apply(style, options, obj) {
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
  options.styleTagTransform(css, style, options.options);
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}

/* istanbul ignore next  */
function domAPI(options) {
  const style = options.insertStyleElement(options);

  return {
    update: (obj) => {
      apply(style, options, obj);
    },
    remove: () => {
      removeStyleElement(style);
    },
  };
}

module.exports = domAPI;
