/* global document, __webpack_nonce__ */
module.exports = (url, options) => {
  if (typeof document === "undefined") {
    return () => {};
  }

  options ||= {};
  options.attributes =
    typeof options.attributes === "object" ? options.attributes : {};

  if (typeof options.attributes.nonce === "undefined") {
    const nonce =
      typeof __webpack_nonce__ !== "undefined" ? __webpack_nonce__ : null;

    if (nonce) {
      options.attributes.nonce = nonce;
    }
  }

  const linkElement = document.createElement("link");

  linkElement.rel = "stylesheet";
  linkElement.href = url;

  for (const key of Object.keys(options.attributes)) {
    linkElement.setAttribute(key, options.attributes[key]);
  }

  options.insert(linkElement);

  return (newUrl) => {
    if (typeof newUrl === "string") {
      linkElement.href = newUrl;
    } else {
      linkElement.parentNode.removeChild(linkElement);
    }
  };
};
