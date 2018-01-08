/* eslint-disable */
export default function addAttrs (el, attrs) {
  Object.keys(attrs).forEach(function (key) {
    el.setAttribute(key, attrs[key]);
  });
};
