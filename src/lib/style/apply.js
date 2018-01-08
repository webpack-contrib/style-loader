/* eslint-disable */
export default function apply(style, obj) {
  let css = obj.css;
  const media = obj.media;
  const sourceMap = obj.sourceMap;

  if (sourceMap) {
    css += `\n/*# sourceMappingURL=data:application/json;base64,${
      btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))))} */`;
  }

  if (media) {
    style.setAttribute('media', media);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}
