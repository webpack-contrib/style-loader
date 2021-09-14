/* istanbul ignore next  */
function insertStyleElement(options) {
  const style = document.createElement("style");

  options.setAttributes(style, options.attributes);

  options.insert(style, options.insertOptions);

  return style;
}

module.exports = insertStyleElement;
