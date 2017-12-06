function removeStyle (style, styles) {
  if (style.parentNode === null) return false;

  style.parentNode.removeChild(style);

  var idx = styles.indexOf(style);

  if(idx >= 0) {
    styles.splice(idx, 1);
  }
}

module.exports = removeStyle;
