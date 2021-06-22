/* istanbul ignore next  */
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

  options.insert(style);

  return style;
}

module.exports = insertStyleElement;
