module.exports = (url, options) => {
  options = options || {};
  options.attributes =
    typeof options.attributes === "object" ? options.attributes : {};

  if (typeof options.attributes.nonce === "undefined") {
    const nonce =
      typeof __webpack_nonce__ !== "undefined" ? __webpack_nonce__ : null;

    if (nonce) {
      options.attributes.nonce = nonce;
    }
  }

  const link = document.createElement("link");

  link.rel = "stylesheet";
  link.href = url;

  Object.keys(options.attributes).forEach((key) => {
    link.setAttribute(key, options.attributes[key]);
  });

  if (typeof options.insert === "function") {
    options.insert(link);
  } else {
    const { specificApi } = options;
    const getTarget = specificApi.getTarget();
    const target = getTarget(options.insert || "head");

    if (!target) {
      throw new Error(
        "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
      );
    }

    target.appendChild(link);
  }

  return (newUrl) => {
    if (typeof newUrl === "string") {
      link.href = newUrl;
    } else {
      link.parentNode.removeChild(link);
    }
  };
};
