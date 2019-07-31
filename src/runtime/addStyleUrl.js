/* eslint-env browser */
/* eslint-disable */

module.exports = function addStyleUrl(url, options) {
  /* istanbul ignore if  */
  if (typeof DEBUG !== 'undefined' && DEBUG) {
    if (typeof document !== 'object') {
      throw new Error(
        'The style-loader cannot be used in a non-browser environment'
      );
    }
  }

  options = options || {};
  options.attributes =
    typeof options.attributes === 'object' ? options.attributes : {};

  if (options.attributes.nonce === undefined) {
    var nonce =
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
    return (url) => {
      if (typeof url === 'string') {
        link.href = url;
      } else {
        head.removeChild(link);
      }
    };
  }
};
