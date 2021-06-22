/* istanbul ignore next  */
function apply(style, options, obj) {
  let css = obj.css;
  const media = obj.media;
  const sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute("media", media);
  } else {
    style.removeAttribute("media");
  }

  if (sourceMap && typeof btoa !== "undefined") {
    css += `\n/*# sourceMappingURL=data:application/json;base64,${btoa(
      unescape(encodeURIComponent(JSON.stringify(sourceMap)))
    )} */`;
  }

  // For old IE
  /* istanbul ignore if  */
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}

/* istanbul ignore next  */
function domApi(options) {
  const style = options.insertStyleElement(options);

  return {
    update: apply.bind(null, style, options),
    remove: () => {
      removeStyleElement(style);
    },
  };
}

module.exports = domApi;
