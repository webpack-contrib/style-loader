/* eslint-disable */
import isIE from './utils/isIE';
import memoize from './utils/memoize';

import addStyle from './style/add';
import convertStyle from './style/convert';

const DOMStyles = {};

// add styles to the DOM
function addStyles(styles, options) {
  for (let i = 0; i < styles.length; i++) {
    const item = styles[i];
    const style = DOMStyles[item.id];

    if (style) {
      style.refs++;

      for (var j = 0; j < style.parts.length; j++) {
        style.parts[j](item.parts[j]);
      }

      for (; j < item.parts.length; j++) {
        style.parts.push(addStyle(item.parts[j], options));
      }
    } else {
      const parts = [];

      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j], options));
      }

      DOMStyles[item.id] = { id: item.id, refs: 1, parts };
    }
  }
}

export default function (list, options) {
  if (typeof DEBUG !== 'undefined' && DEBUG) {
    if (typeof document !== 'object') throw new Error('The style-loader cannot be used in a non-browser environment');
  }

  options = options || {};

  options.attrs = typeof options.attrs === 'object' ? options.attrs : {};
  // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page
  if (!options.singleton) options.singleton = isIE();
  // By default, add <style> tags to the <head> element
  if (!options.insertInto) options.insertInto = 'head';
  // By default, add <style> tags to the bottom of the target
  if (!options.insertAt) options.insertAt = 'bottom';

  const styles = convertStyle(list, options);

  addStyles(styles, options);

  return function update(newList) {
    const mayRemove = [];

    for (var i = 0; i < styles.length; i++) {
      const item = styles[i];
      // DOM Style
      var style = DOMStyles[item.id];

      style.refs--;
      mayRemove.push(style);
    }

    if (newList) {
      const newStyles = convertStyle(newList, options);

      addStyles(newStyles, options);
    }

    for (var i = 0; i < mayRemove.length; i++) {
      var style = mayRemove[i];

      if (style.refs === 0) {
        for (let j = 0; j < style.parts.length; j++) style.parts[j]();

        delete DOMStyles[style.id];
      }
    }
  };
};
