/* eslint-disable */
const attrs = require('../utils/attrs');
const insertStyle = require('../style/insert');

export default function createLink(options) {
  const link = document.createElement('link');

  options.attrs.type = 'text/css';
  options.attrs.rel = 'stylesheet';

  attrs(link, options.attrs);
  insertStyle(options, link);

  return link;
}
