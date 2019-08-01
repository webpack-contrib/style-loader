module.exports = function injectStylesIntoLinkTag(url, options) {
  options = options || {};
  options.attributes =
    typeof options.attributes === 'object' ? options.attributes : {};

  if (typeof options.attributes.nonce === 'undefined') {
    const nonce =
      typeof __webpack_nonce__ !== 'undefined' ? __webpack_nonce__ : null;

    if (nonce) {
      options.attributes.nonce = nonce;
    }
  }

  const link = document.createElement('link');

  link.rel = 'stylesheet';
  link.href = url;

  Object.keys(options.attributes).forEach((key) => {
    link.setAttribute(key, options.attributes[key]);
  });

  const head = document.getElementsByTagName('head')[0];

  head.appendChild(link);

  if (module.hot) {
    return (newUrl) => {
      if (typeof newUrl === 'string') {
        link.href = newUrl;
      } else {
        head.removeChild(link);
      }
    };
  }
};
