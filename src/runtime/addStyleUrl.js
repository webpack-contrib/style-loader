/* eslint-env browser */
/* eslint-disable */

function addAttrs(element, attrs) {
  Object.keys(attrs).forEach((key) => {
    element.setAttribute(key, attrs[key]);
  });
}

module.exports = function addStyleUrl(url, options) {
  if (typeof DEBUG !== 'undefined' && DEBUG) {
    if (typeof document !== 'object') {
      throw new Error(
        'The style-loader cannot be used in a non-browser environment'
      );
    }
  }

  options = options || {};

  options.attrs = typeof options.attrs === 'object' ? options.attrs : {};
  options.hmr = typeof options.hmr === 'undefined' ? true : options.hmr;

  const link = document.createElement('link');

  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;

  addAttrs(link, options.attrs);

  const [head] = document.getElementsByTagName('head');

  head.appendChild(link);

  if (options.hmr && module.hot) {
    return (url) => {
      if (typeof url === 'string') {
        link.href = url;
      } else {
        head.removeChild(link);
      }
    };
  }
};
