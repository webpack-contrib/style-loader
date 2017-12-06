function applyToTag (style, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (sourceMap) {
    css += "\n/*# sourceMappingURL=data:application/json;base64," +
      btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
  }

  if(media) {
    style.setAttribute("media", media)
  }

  if(style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while(style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

module.exports = applyToTag;
