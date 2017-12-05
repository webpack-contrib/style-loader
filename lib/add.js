const createLink = require('./link/create');

const createStyle = require('./style/create');
const removeStyle = require('./style/remove');

const applyToTag = require('./utils/apply');
const applyToSingletonTag = require('./utils/applySingleton');

var singleton = null;
var singletonCounter = 0;

var styles = [];

function addStyle(obj, options) {
  var style, update, remove, result;
  // If a transform function was defined, run it on the css
  if (options.transform && obj.css) {
      result = options.transform(obj.css);

      if (result) {
        // If transform returns a value, use that instead of the original css.
        // This allows running runtime transformations on the css.
        obj.css = result;
      } else {
        // If the transform function returns a falsy value, don't add this css.
        // This allows conditional loading of css
        return function() {};
      }
  }

  if (options.singleton) {
    var styleIndex = singletonCounter++;

    style = singleton || (singleton = createStyle(options, styles));

    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = createStyle(options, styles);
    update = applyToTag.bind(null, style);
    remove = function () {
      removeStyle(style, styles);
    };
  }

  update(obj);

  return function updateStyle (newObj) {
    if (newObj) {
      if (
        newObj.css === obj.css &&
        newObj.media === obj.media &&
        newObj.sourceMap === obj.sourceMap
      ) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = addStyle;
