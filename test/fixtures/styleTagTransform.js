function styleTagTransform(css, style) {
  // eslint-disable-next-line no-param-reassign
  style.innerHTML = `${css}.modify{}\n`;

  document.head.appendChild(style);
}

module.exports = styleTagTransform;
