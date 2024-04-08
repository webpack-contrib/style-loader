function insert(element) {
  const parent = document.querySelector("head");
  const target = document.querySelector("#existing-style");

  const lastInsertedElement =
    // eslint-disable-next-line no-underscore-dangle
    window._lastElementInsertedByStyleLoader;

  if (!lastInsertedElement) {
    parent.insertBefore(element, target);
  } else if (lastInsertedElement.nextSibling) {
    parent.insertBefore(element, lastInsertedElement.nextSibling);
  } else {
    parent.appendChild(element);
  }

  window._lastElementInsertedByStyleLoader = element;
}

module.exports = insert;
