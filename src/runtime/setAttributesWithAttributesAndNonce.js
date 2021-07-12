/* istanbul ignore next  */
function setAttributesWithoutAttributes(style, attributes) {
  Object.keys(attributes).forEach((key) => {
    style.setAttribute(key, attributes[key]);
  });
}

module.exports = setAttributesWithoutAttributes;
