/* istanbul ignore next  */
function insertStyleElement(options) {
  const style = document.createElement("style");

  options.setAttributes(style, options.attributes);

  options.insert(style, options.options);

  return style;
}

module.exports = insertStyleElement;
