const stylesInDom = {};

const isOldIE = (function isOldIE() {
  let memo;

  return function memorized() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
})();

function getTarget(target, parent) {
  if (parent) {
    return parent.querySelector(target);
  }

  return document.querySelector(target);
}

const getElement = (function getElement() {
  const memo = {};

  return function memorized(target, parent) {
    // If passing function in options, then use it for resolve "head" element.
    // Useful for Shadow Root style i.e
    // {
    //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
    // }
    if (typeof target === 'function') {
      return target();
    }

    if (typeof memo[target] === 'undefined') {
      let styleTarget = getTarget.call(this, target, parent);

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
})();

let singleton = null;
let singletonCounter = 0;
const stylesInsertedAtTop = [];

module.exports = (list, options) => {
  options = options || {};

  options.attributes =
    typeof options.attributes === 'object' ? options.attributes : {};

  // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page
  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  // By default, add <style> tags to the <head> element
  if (!options.insertInto) {
    options.insertInto = 'head';
  }

  // By default, add <style> tags to the bottom of the target
  if (!options.insertAt) {
    options.insertAt = 'bottom';
  }

  const styles = listToStyles(list, options);

  addStylesToDom(styles, options);

  return function update(newList) {
    const mayRemove = [];

    for (let i = 0; i < styles.length; i++) {
      const item = styles[i];
      const domStyle = stylesInDom[item.id];

      if (domStyle) {
        domStyle.refs--;
        mayRemove.push(domStyle);
      }
    }

    if (newList) {
      const newStyles = listToStyles(newList, options);

      addStylesToDom(newStyles, options);
    }

    for (let i = 0; i < mayRemove.length; i++) {
      const domStyle = mayRemove[i];

      if (domStyle.refs === 0) {
        for (let j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]();
        }

        delete stylesInDom[domStyle.id];
      }
    }
  };
};

function addStylesToDom(styles, options) {
  for (let i = 0; i < styles.length; i++) {
    const item = styles[i];
    const domStyle = stylesInDom[item.id];
    let j = 0;

    if (domStyle) {
      domStyle.refs++;

      for (; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j]);
      }

      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j], options));
      }
    } else {
      const parts = [];

      for (; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j], options));
      }

      stylesInDom[item.id] = { id: item.id, refs: 1, parts };
    }
  }
}

function listToStyles(list, options) {
  const styles = [];
  const newStyles = {};

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const id = options.base ? item[0] + options.base : item[0];
    const css = item[1];
    const media = item[2];
    const sourceMap = item[3];
    const part = { css, media, sourceMap };

    if (!newStyles[id]) {
      styles.push((newStyles[id] = { id, parts: [part] }));
    } else {
      newStyles[id].parts.push(part);
    }
  }

  return styles;
}

function insertStyleElement(options) {
  const style = document.createElement('style');

  if (typeof options.attributes.nonce === 'undefined') {
    const nonce =
      typeof __webpack_nonce__ !== 'undefined' ? __webpack_nonce__ : null;

    if (nonce) {
      options.attributes.nonce = nonce;
    }
  }

  Object.keys(options.attributes).forEach((key) => {
    style.setAttribute(key, options.attributes[key]);
  });

  const target = getElement(options.insertInto);

  if (!target) {
    throw new Error(
      "Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid."
    );
  }

  if (options.insertAt === 'top') {
    const lastStyleElementInsertedAtTop =
      stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

    if (!lastStyleElementInsertedAtTop) {
      target.insertBefore(style, target.firstChild);
    } else if (lastStyleElementInsertedAtTop.nextSibling) {
      target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
    } else {
      target.appendChild(style);
    }

    stylesInsertedAtTop.push(style);
  } else if (options.insertAt === 'bottom') {
    target.appendChild(style);
  } else if (typeof options.insertAt === 'object' && options.insertAt.before) {
    const nextSibling = getElement(options.insertAt.before, target);

    target.insertBefore(style, nextSibling);
  } else {
    throw new Error(
      "[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n"
    );
  }

  return style;
}

function removeStyleElement(style) {
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);

  const idx = stylesInsertedAtTop.indexOf(style);

  if (idx >= 0) {
    stylesInsertedAtTop.splice(idx, 1);
  }
}

function addStyle(obj, options) {
  let style;
  let update;
  let remove;

  if (options.singleton) {
    const styleIndex = singletonCounter++;

    style = singleton || (singleton = insertStyleElement(options));

    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);

    update = applyToTag.bind(null, style, options);
    remove = () => {
      removeStyleElement(style);
    };
  }

  update(obj);

  return function updateStyle(newObj) {
    if (newObj) {
      if (
        newObj.css === obj.css &&
        newObj.media === obj.media &&
        newObj.sourceMap === obj.sourceMap
      ) {
        return;
      }

      update((obj = newObj));
    } else {
      remove();
    }
  };
}

/* istanbul ignore next  */
const replaceText = (function replaceText() {
  const textStore = [];

  return function replace(index, replacement) {
    textStore[index] = replacement;

    return textStore.filter(Boolean).join('\n');
  };
})();

function applyToSingletonTag(style, index, remove, obj) {
  const css = remove ? '' : obj.css;

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

function applyToTag(style, options, obj) {
  let css = obj.css;
  const media = obj.media;
  const sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  }

  if (sourceMap && btoa) {
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
