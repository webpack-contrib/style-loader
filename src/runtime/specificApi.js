/* istanbul ignore next  */
function getTarget() {
  const memo = {};

  return function memorize(target) {
    if (typeof memo[target] === "undefined") {
      let styleTarget = document.querySelector(target);

      // Special case to return head of iframe instead of iframe itself
      if (
        window.HTMLIFrameElement &&
        styleTarget instanceof window.HTMLIFrameElement
      ) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}

/* istanbul ignore next  */
const replaceText = (function replaceText() {
  const textStore = [];

  return function replace(index, replacement) {
    textStore[index] = replacement;

    return textStore.filter(Boolean).join("\n");
  };
})();

/* istanbul ignore next  */
function applyToSingletonTag(style, index, remove, obj) {
  const css = remove
    ? ""
    : obj.media
      ? `@media ${obj.media} {${obj.css}}`
      : obj.css;

  // For old IE
  /* istanbul ignore if  */
  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    const cssNode = document.createTextNode(css);
    const childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

/* istanbul ignore next  */
function applyToTag(style, options, obj) {
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

export { applyToSingletonTag, applyToTag, removeStyleElement, getTarget };
