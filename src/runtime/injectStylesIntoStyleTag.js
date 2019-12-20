const stylesInDom = {};

const getTarget = (function getTarget() {
  const memo = {};

  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
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
})();

function addModulesToDom(id, list, options) {
  id = options.base ? id + options.base : id;

  if (!stylesInDom[id]) {
    stylesInDom[id] = [];
  }

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const part = { css: item[1], media: item[2], sourceMap: item[3] };
    const styleInDomById = stylesInDom[id];

    if (styleInDomById[i]) {
      styleInDomById[i].updater(part);
    } else {
      styleInDomById.push({ updater: addStyle(part, options) });
    }
  }

  for (let j = list.length; j < stylesInDom[id].length; j++) {
    stylesInDom[id][j].updater();
  }

  stylesInDom[id].length = list.length;

  if (stylesInDom[id].length === 0) {
    delete stylesInDom[id];
  }
}

function addStyle(obj, options) {
  const style = document.createElement('style');
  const attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    const nonce =
      typeof __webpack_nonce__ !== 'undefined' ? __webpack_nonce__ : null;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach((key) => {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    const target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error(
        "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
      );
    }

    target.appendChild(style);
  }

  const update = (newObj) => {
    let css = newObj.css;
    const media = newObj.media;
    const sourceMap = newObj.sourceMap;

    if (media) {
      style.setAttribute('media', media);
    } else {
      style.removeAttribute('media');
    }

    if (sourceMap && btoa) {
      css += `\n/*# sourceMappingURL=data:application/json;base64,${btoa(
        unescape(encodeURIComponent(JSON.stringify(sourceMap)))
      )} */`;
    }

    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  };
  const remove = () => {
    // istanbul ignore if
    if (style.parentNode === null) {
      return false;
    }

    style.parentNode.removeChild(style);
  };

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

module.exports = (id, list, options) => {
  options = options || {};

  addModulesToDom(id, list, options);

  return function update(newList) {
    addModulesToDom(id, newList || [], options);
  };
};
