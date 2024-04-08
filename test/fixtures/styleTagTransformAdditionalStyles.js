function styleTagTransform(css, style, options) {
  style.innerHTML = `${css}\n${options.additionalStyles}\n`;
}

module.exports = styleTagTransform;
