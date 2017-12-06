const isIE = require('./utils/isIE');
const memoize = require('./utils/memoize');

const toStyle = require('./style/convert')
const addStyle = require('./add');

var DOMStyles = {};

function addStylesToDom(styles, options) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i];
    var domStyle = DOMStyles[item.id];

    if(domStyle) {
      domStyle.refs++;

      for(var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j]);
      }

      for(; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j], options));
      }
    } else {
      var parts = [];

      for(var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j], options));
      }

      DOMStyles[item.id] = {id: item.id, refs: 1, parts: parts};
    }
  }
}

module.exports = function(list, options) {
  if (typeof DEBUG !== "undefined" && DEBUG) {
    if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
  }

  options = options || {};

  options.attrs = typeof options.attrs === "object" ? options.attrs : {};
  // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page
  if (!options.singleton) options.singleton = isIE();
  // By default, add <style> tags to the <head> element
  if (!options.insertInto) options.insertInto = "head";
  // By default, add <style> tags to the bottom of the target
  if (!options.insertAt) options.insertAt = "bottom";

  var styles = toStyle(list, options);

  addStylesToDom(styles, options);

  return function update (newList) {
    var mayRemove = [];

    for (var i = 0; i < styles.length; i++) {
      var item = styles[i];
      var domStyle = DOMStyles[item.id];

      domStyle.refs--;
      mayRemove.push(domStyle);
    }

    if(newList) {
      var newStyles = toStyle(newList, options);

      addStylesToDom(newStyles, options);
    }

    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i];

      if(domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

        delete DOMStyles[domStyle.id];
      }
    }
  };
};
