/* global __webpack_nonce__ */
/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement, attributes) {
  const nonce =
    typeof __webpack_nonce__ !== "undefined" ? __webpack_nonce__ : null;

  if (nonce) {
    attributes.nonce = nonce;
  }

  for (const key of Object.keys(attributes)) {
    styleElement.setAttribute(key, attributes[key]);
  }
}

module.exports = setAttributesWithoutAttributes;
