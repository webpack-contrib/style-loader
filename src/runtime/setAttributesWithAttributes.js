/* istanbul ignore next  */
function setAttributesWithoutAttributes(style, attributes) {
  const nonce =
    typeof __webpack_nonce__ !== "undefined" ? __webpack_nonce__ : null;

  if (nonce) {
    attributes.nonce = nonce;
  }

  Object.keys(attributes).forEach((key) => {
    style.setAttribute(key, attributes[key]);
  });
}

module.exports = setAttributesWithoutAttributes;
