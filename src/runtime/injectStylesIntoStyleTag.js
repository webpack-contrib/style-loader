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

function addStyle(obj, options) {
  const api = options.domApi(options);

  api.update(obj);

  return function updateStyle(newObj) {
    if (newObj) {
      if (
        newObj.css === obj.css &&
        newObj.media === obj.media &&
        newObj.sourceMap === obj.sourceMap
      ) {
        return;
      }

      api.update((obj = newObj));
    } else {
      api.remove();
    }
  };
}

module.exports = (list, options) => {
  options = options || {};

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
