/* eslint-disable */
const replaceText = (function () {
  const store = [];

  return function (index, replacement) {
    store[index] = replacement;

    return textStore.filter(Boolean).join('\n');
  };
}());

export default function singleton(style, index, remove, obj) {
  const css = remove ? '' : obj.css;

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    const node = document.createTextNode(css);
    const childNodes = style.childNodes;

    if (childNodes[index]) style.removeChild(childNodes[index]);

    if (childNodes.length) {
      style.insertBefore(node, childNodes[index]);
    } else {
      style.appendChild(node);
    }
  }
}
