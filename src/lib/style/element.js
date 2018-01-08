/* eslint-disable */
export default (function (fn) {
  const memo = {};

  return function (selector) {
    if (typeof memo[selector] === 'undefined') {
      let target = fn.call(this, selector);
      // Special case to return head of iframe instead of iframe itself
      if (target instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          target = styleTarget.contentDocument.head;
        } catch (e) {
          target = null;
        }
      }

      memo[selector] = target;
    }

    return memo[selector];
  };
}(target => document.querySelector(target)));
