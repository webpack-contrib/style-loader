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

/* istanbul ignore next  */
function insertStyleElement(options) {
  const style = document.createElement("style");
  const attributes = options.attributes || {};

  if (typeof attributes.nonce === "undefined") {
    const nonce =
      typeof __webpack_nonce__ !== "undefined" ? __webpack_nonce__ : null;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach((key) => {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === "function") {
    options.insert(style);
  } else {
    // eslint-disable-next-line no-shadow
    const getTarget = options.api.getTarget();
    const target = getTarget(options.insert || "head");

    if (!target) {
      throw new Error(
        "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
      );
    }

    target.appendChild(style);
  }

  return style;
}

// Todo wil be use for autoTag
/* istanbul ignore next  */
function autoApi(options) {
  // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page
  if (!options.singleton && typeof options.singleton !== "boolean") {
    // eslint-disable-next-line no-undef
    options.singleton = isOldIE();
  }

  let styleIndex;
  let style;

  if (options.singleton) {
    // eslint-disable-next-line no-undef
    styleIndex = singletonData.singletonCounter++;
    style =
      // eslint-disable-next-line no-undef
      singletonData.singleton ||
      // eslint-disable-next-line no-undef
      (singletonData.singleton = options.api.insertStyleElement(options));
  } else {
    style = options.api.insertStyleElement(options);
  }

  if (options.singleton) {
    return {
      update: options.api.applyToSingletonTag.bind(
        null,
        style,
        styleIndex,
        false
      ),
      remove: options.api.applyToSingletonTag.bind(
        null,
        style,
        styleIndex,
        true
      ),
    };
  }

  return {
    update: options.api.applyToTag.bind(null, style, options),
    remove: () => {
      options.api.removeStyleElement(style);
    },
  };
}

/* istanbul ignore next  */
function basicApi(options) {
  const style = options.api.insertStyleElement(options);

  return {
    update: options.api.applyToTag.bind(null, style, options),
    remove: () => {
      options.api.removeStyleElement(style);
    },
  };
}

/* istanbul ignore next  */
function singletonApi(options) {
  // eslint-disable-next-line no-undef
  const styleIndex = singletonData.singletonCounter++;
  const style =
    // eslint-disable-next-line no-undef
    singletonData.singleton ||
    // eslint-disable-next-line no-undef
    (singletonData.singleton = options.api.insertStyleElement(options));

  return {
    update: options.api.applyToSingletonTag.bind(
      null,
      style,
      styleIndex,
      false
    ),
    remove: options.api.applyToSingletonTag.bind(null, style, styleIndex, true),
  };
}

export {
  applyToSingletonTag,
  applyToTag,
  removeStyleElement,
  getTarget,
  autoApi,
  singletonApi,
  basicApi,
  insertStyleElement,
};
