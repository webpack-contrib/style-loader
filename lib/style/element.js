var getElement = (function (fn) {
  var memo = {};

  return function(selector) {
    if (typeof memo[selector] === "undefined") {
      var styleTarget = fn.call(this, selector);
      // Special case to return head of iframe instead of iframe itself
      if (styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch(e) {
          styleTarget = null;
        }
      }

      memo[selector] = styleTarget;
    }

    return memo[selector]
  };
})(function (target) {
  return document.querySelector(target)
});

module.exports = getElement;
