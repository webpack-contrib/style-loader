const getElement = require('./element');

function insertStyle (options, style, styles) {
  var target = getElement(options.insertInto)

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
  }

  var lastStyle = styles[styles.length - 1];

  if (options.insertAt === "top") {
    if (!lastStyle) {
      target.insertBefore(style, target.firstChild);
    } else if (lastStyle.nextSibling) {
      target.insertBefore(style, lastStyle.nextSibling);
    } else {
      target.appendChild(style);
    }

    styles.push(style);
  } else if (options.insertAt === "bottom") {
    target.appendChild(style);
  } else if (typeof options.insertAt === "object" && options.insertAt.before) {
    var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);

    target.insertBefore(style, nextSibling);
  } else {
    throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
  }
}

module.exports = insertStyle;
