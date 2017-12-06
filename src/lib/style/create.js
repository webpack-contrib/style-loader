const addAttrs = require('../utils/attrs');
const insertStyle = require('./insert');

function createStyle (options, styles) {
  var style = document.createElement('style');

  options.attrs.type = 'text/css';

  addAttrs(style, options.attrs);
  insertStyle(options, style, styles);

  return style;
}

module.exports = createStyle;
