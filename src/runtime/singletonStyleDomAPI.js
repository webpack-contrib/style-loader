/* istanbul ignore next  */
const replaceText = (function replaceText() {
  const textStore = [];

  return function replace(index, replacement) {
    textStore[index] = replacement;

    return textStore.filter(Boolean).join("\n");
  };
})();

/* istanbul ignore next  */
function apply(styleElement, index, remove, obj) {
  let css;

  if (remove) {
    css = "";
  } else {
    css = "";

    if (obj.supports) {
      css += `@supports (${obj.supports}) {`;
    }

    if (obj.media) {
      css += `@media ${obj.media} {`;
    }

    const needLayer = typeof obj.layer !== "undefined";

    if (needLayer) {
      css += `@layer${obj.layer.length > 0 ? ` ${obj.layer}` : ""} {`;
    }

    css += obj.css;

    if (needLayer) {
      css += "}";
    }

    if (obj.media) {
      css += "}";
    }

    if (obj.supports) {
      css += "}";
    }
  }

  // For old IE
  /* istanbul ignore if  */
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css);
  } else {
    const cssNode = document.createTextNode(css);
    const childNodes = styleElement.childNodes;

    if (childNodes[index]) {
      styleElement.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index]);
    } else {
      styleElement.appendChild(cssNode);
    }
  }
}

const singletonData = {
  singleton: null,
  singletonCounter: 0,
};

/* istanbul ignore next  */
function domAPI(options) {
  // eslint-disable-next-line no-undef,no-use-before-define
  const styleIndex = singletonData.singletonCounter++;
  const styleElement =
    // eslint-disable-next-line no-undef,no-use-before-define
    singletonData.singleton ||
    // eslint-disable-next-line no-undef,no-use-before-define
    (singletonData.singleton = options.insertStyleElement(options));

  return {
    update: (obj) => {
      apply(styleElement, styleIndex, false, obj);
    },
    remove: (obj) => {
      apply(styleElement, styleIndex, true, obj);
    },
  };
}

module.exports = domAPI;
