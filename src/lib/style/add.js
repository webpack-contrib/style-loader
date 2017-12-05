/* eslint-disable */
import createStyle from './create';
import removeStyle from './remove';
import applyStyle from './apply';
import applySingleton from './singleton';

const singleton = {
  idx: 0,
  style: null,
};

const styles = [];

export default function addStyle(obj, options) {
  let style,
    update,
    remove,
    result;
  // TODO remove or split if possible
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
      return function () {};
    }
  }

  // TODO split if possible
  if (options.singleton) {
    const idx = singleton.idx++;

    style = singleton.style || (singleton.style = createStyle(options, styles));

    update = applySingleton.bind(null, style, idx, false);
    remove = applySingleton.bind(null, style, idx, true);
  } else {
    style = createStyle(options, styles);
    update = applyStyle.bind(null, style);
    remove = function () {
      removeStyle(style, styles);
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

      update(obj = newObj);
    } else {
      remove();
    }
  };
}
