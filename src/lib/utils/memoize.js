/* eslint-disable */
const memoize = function (fn) {
  let memo;

  return function () {
    if (typeof memo === "undefined") memo = fn.apply(this, arguments);

    return memo;
  };
};

export default memoize;
