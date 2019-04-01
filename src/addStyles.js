import fixUrls from './urls';

const stylesInDom = {};

const memoize = (fn) => {
  let memo;

  return (...args) => {
    if (typeof memo === 'undefined') {
      memo = fn.apply(this, args);
    }

    return memo;
  };
};

const isOldIE = memoize(
  () =>
    // Test for IE <= 9 as proposed by Browserhacks
    // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
    // Tests for existence of standard globals is to allow style-loader
    // to operate correctly into non-standard environments
    // @see https://github.com/webpack-contrib/style-loader/issues/177
    window && document && document.all && !window.atob
);

const getTarget = (target, parent) => {
  if (parent) {
    return parent.querySelector(target);
  }
  return document.querySelector(target);
};

const getElement = (() => {
  const memo = {};

  return (target, parent) => {
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
  if (typeof DEBUG !== 'undefined' && DEBUG) {
    if (typeof document !== 'object') {
      throw new Error(
        'The style-loader cannot be used in a non-browser environment'
      );
    }
  }

  options = options || {};

  options.attrs = typeof options.attrs === 'object' ? options.attrs : {};

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

      domStyle.refs -= 1;
      mayRemove.push(domStyle);
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

    if (domStyle) {
      domStyle.refs += 1;

      let j = 0;

      for (j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j]);
      }

      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j], options));
      }
    } else {
      const parts = [];

      for (let j = 0; j < item.parts.length; j++) {
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
    const [itemId, css, media, sourceMap] = list[i];
    const id = options.base ? itemId + options.base : itemId;
    const part = { css, media, sourceMap };

    if (!newStyles[id]) {
      styles.push((newStyles[id] = { id, parts: [part] }));
    } else {
      newStyles[id].parts.push(part);
    }
  }

  return styles;
}

function insertStyleElement(options, style) {
  const target = getElement(options.insertInto);

  if (!target) {
    throw new Error(
      "Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid."
    );
  }

  const lastStyleElementInsertedAtTop =
    stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

  if (options.insertAt === 'top') {
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
}

function removeStyleElement(style) {
  if (style.parentNode === null) {
    return;
  }

  style.parentNode.removeChild(style);

  const idx = stylesInsertedAtTop.indexOf(style);

  if (idx >= 0) {
    stylesInsertedAtTop.splice(idx, 1);
  }
}

function createStyleElement(options) {
  const style = document.createElement('style');

  if (typeof options.attrs.type === 'undefined') {
    options.attrs.type = 'text/css';
  }

  if (typeof options.attrs.nonce === 'undefined') {
    const nonce = getNonce();

    if (nonce) {
      options.attrs.nonce = nonce;
    }
  }

  addAttrs(style, options.attrs);
  insertStyleElement(options, style);

  return style;
}

function createLinkElement(options) {
  const link = document.createElement('link');

  if (typeof options.attrs.type === 'undefined') {
    options.attrs.type = 'text/css';
  }

  options.attrs.rel = 'stylesheet';

  addAttrs(link, options.attrs);
  insertStyleElement(options, link);

  return link;
}

function addAttrs(el, attrs) {
  Object.keys(attrs).forEach((key) => {
    el.setAttribute(key, attrs[key]);
  });
}

function getNonce() {
  if (typeof __webpack_nonce__ === 'undefined') {
    return null;
  }

  return __webpack_nonce__;
}

function addStyle(obj, options) {
  let style;
  let update;
  let remove;
  let result;

  // If a transform function was defined, run it on the css
  if (options.transform && obj.css) {
    result =
      typeof options.transform === 'function'
        ? options.transform(obj.css)
        : options.transform.default(obj.css);

    if (result) {
      // If transform returns a value, use that instead of the original css.
      // This allows running runtime transformations on the css.
      obj.css = result;
    } else {
      // If the transform function returns a falsy value, don't add this css.
      // This allows conditional loading of css
      return () => {
        // noop
      };
    }
  }

  if (options.singleton) {
    singletonCounter += 1;

    const styleIndex = singletonCounter;

    style = singleton || (singleton = createStyleElement(options));

    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else if (
    obj.sourceMap &&
    typeof URL === 'function' &&
    typeof URL.createObjectURL === 'function' &&
    typeof URL.revokeObjectURL === 'function' &&
    typeof Blob === 'function' &&
    typeof btoa === 'function'
  ) {
    style = createLinkElement(options);
    update = updateLink.bind(null, style, options);
    remove = () => {
      removeStyleElement(style);

      if (style.href) {
        URL.revokeObjectURL(style.href);
      }
    };
  } else {
    style = createStyleElement(options);
    update = applyToTag.bind(null, style);
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

const replaceText = (() => {
  const textStore = [];

  return (index, replacement) => {
    textStore[index] = replacement;

    return textStore.filter(Boolean).join('\n');
  };
})();

function applyToSingletonTag(style, index, remove, obj) {
  const css = remove ? '' : obj.css;

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    const cssNode = document.createTextNode(css);
    const { childNodes } = style;

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

function applyToTag(style, obj) {
  const { css } = obj;
  const { media } = obj;

  if (media) {
    style.setAttribute('media', media);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

function updateLink(link, options, obj) {
  let { css } = obj;
  const { sourceMap } = obj;

  /*
    If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
    and there is no publicPath defined then lets turn convertToAbsoluteUrls
    on by default.  Otherwise default to the convertToAbsoluteUrls option
    directly
  */
  const autoFixUrls =
    typeof options.convertToAbsoluteUrls === 'undefined' && sourceMap;

  if (options.convertToAbsoluteUrls || autoFixUrls) {
    css = fixUrls(css);
  }

  if (sourceMap) {
    // http://stackoverflow.com/a/26603875
    css += `\n/*# sourceMappingURL=data:application/json;base64,${btoa(
      unescape(encodeURIComponent(JSON.stringify(sourceMap)))
    )} */`;
  }

  const blob = new Blob([css], { type: 'text/css' });
  const oldSrc = link.href;

  link.href = URL.createObjectURL(blob);

  if (oldSrc) {
    URL.revokeObjectURL(oldSrc);
  }
}
