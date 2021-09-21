const stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  let result = -1;

  for (let i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
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

    const indexByIdentifier = getIndexByIdentifier(identifier);
    const obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5],
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      const updater = addElementStyle(obj, options);

      options.byIndex = i;

      stylesInDOM.splice(i, 0, {
        identifier,
        updater,
        references: 1,
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  const api = options.domAPI(options);

  api.update(obj);

  const updater = (newObj) => {
    if (newObj) {
      if (
        newObj.css === obj.css &&
        newObj.media === obj.media &&
        newObj.sourceMap === obj.sourceMap &&
        newObj.supports === obj.supports &&
        newObj.layer === obj.layer
      ) {
        return;
      }

      api.update((obj = newObj));
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = (list, options) => {
  options = options || {};

  list = list || [];

  let lastIdentifiers = modulesToDom(list, options);

  return function update(newList) {
    newList = newList || [];

    for (let i = 0; i < lastIdentifiers.length; i++) {
      const identifier = lastIdentifiers[i];
      const index = getIndexByIdentifier(identifier);

      stylesInDOM[index].references--;
    }

    const newLastIdentifiers = modulesToDom(newList, options);

    for (let i = 0; i < lastIdentifiers.length; i++) {
      const identifier = lastIdentifiers[i];
      const index = getIndexByIdentifier(identifier);

      if (stylesInDOM[index].references === 0) {
        stylesInDOM[index].updater();
        stylesInDOM.splice(index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};
