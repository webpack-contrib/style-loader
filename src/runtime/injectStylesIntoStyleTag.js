const isOldIE = (function isOldIE() {
  let memo;

  return function memorize() {
    if (typeof memo === "undefined") {
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

const stylesInDom = [];

function getIndexByIdentifier(identifier) {
  let result = -1;

  for (let i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  const idCountMap = {};
  const identifiers = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const id = options.base ? item[0] + options.base : item[0];
    const count = idCountMap[id] || 0;
    const identifier = `${id} ${count}`;

    idCountMap[id] = count + 1;

    const index = getIndexByIdentifier(identifier);
    const obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier,
        updater: addStyle(obj, options),
        references: 1,
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

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
    const { specificApi } = options;
    const getTarget = specificApi.getTarget();
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

let singleton = null;
let singletonCounter = 0;

function addStyle(obj, options) {
  const { specificApi } = options;
  let style;
  let update;
  let remove;

  if (options.singleton) {
    const styleIndex = singletonCounter++;
console.log(options)
    style = singleton || (singleton = insertStyleElement(options));

    update = specificApi.applyToSingletonTag.bind(
      null,
      style,
      styleIndex,
      false
    );
    remove = specificApi.applyToSingletonTag.bind(
      null,
      style,
      styleIndex,
      true
    );
  } else {
    style = insertStyleElement(options);

    update = specificApi.applyToTag.bind(null, style, options);
    remove = () => {
      specificApi.removeStyleElement(style);
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

module.exports = (list, options) => {
  options = options || {};

  // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page
  if (!options.singleton && typeof options.singleton !== "boolean") {
    options.singleton = isOldIE();
  }

  list = list || [];

  let lastIdentifiers = modulesToDom(list, options);

  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== "[object Array]") {
      return;
    }

    for (let i = 0; i < lastIdentifiers.length; i++) {
      const identifier = lastIdentifiers[i];
      const index = getIndexByIdentifier(identifier);

      stylesInDom[index].references--;
    }

    const newLastIdentifiers = modulesToDom(newList, options);

    for (let i = 0; i < lastIdentifiers.length; i++) {
      const identifier = lastIdentifiers[i];
      const index = getIndexByIdentifier(identifier);

      if (stylesInDom[index].references === 0) {
        stylesInDom[index].updater();
        stylesInDom.splice(index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};
