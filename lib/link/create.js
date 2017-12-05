const addAttrs = require('../utils/attrs');
const insertStyleElement = require('../style/insert');

function createLinkElement (options) {
  var link = document.createElement("link");

  options.attrs.type = "text/css";
  options.attrs.rel = "stylesheet";

  addAttrs(link, options.attrs);
  insertStyleElement(options, link);

  return link;
}

module.exports = createLinkElement;
