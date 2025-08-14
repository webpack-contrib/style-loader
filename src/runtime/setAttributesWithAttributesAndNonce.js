/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement, attributes) {
  for (const key of Object.keys(attributes)) {
    styleElement.setAttribute(key, attributes[key]);
  }
}

module.exports = setAttributesWithoutAttributes;
