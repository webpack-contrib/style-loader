/**
 * @jest-environment jsdom
 */

/* eslint-env browser */

import injectStylesIntoLinkTag from "../../src/runtime/injectStylesIntoLinkTag";

import insertBySelector from "../../src/runtime/insertBySelector";

const getInsertFn = (place) => insertBySelector.bind(null, place);

function insertAtTop(element) {
  const parent = document.querySelector("head");
  // eslint-disable-next-line no-underscore-dangle
  const lastInsertedElement = window._lastElementInsertedByStyleLoader;

  if (!lastInsertedElement) {
    parent.insertBefore(element, parent.firstChild);
  } else if (lastInsertedElement.nextSibling) {
    parent.insertBefore(element, lastInsertedElement.nextSibling);
  } else {
    parent.appendChild(element);
  }

  // eslint-disable-next-line no-underscore-dangle
  window._lastElementInsertedByStyleLoader = element;
}

function insertBeforeAt(element) {
  const parent = document.querySelector("head");
  const target = document.querySelector("#id");

  // eslint-disable-next-line no-underscore-dangle
  const lastInsertedElement = window._lastElementInsertedByStyleLoader;

  if (!lastInsertedElement) {
    parent.insertBefore(element, target);
  } else if (lastInsertedElement.nextSibling) {
    parent.insertBefore(element, lastInsertedElement.nextSibling);
  } else {
    parent.appendChild(element);
  }

  // eslint-disable-next-line no-underscore-dangle
  window._lastElementInsertedByStyleLoader = element;
}

describe("addStyle", () => {
  let defaultOptions;

  beforeEach(() => {
    document.head.innerHTML = "<title>Title</title>";
    document.body.innerHTML = "<h1>Hello world</h1>";

    defaultOptions = {
      insert: getInsertFn("head"),
    };
  });

  // Each query should have be unique because style-loader caching styles in dom

  it("should work", () => {
    injectStylesIntoLinkTag("./style-1.css", defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attributes" option', () => {
    injectStylesIntoLinkTag("./style-2.css", {
      ...defaultOptions,
      attributes: { foo: "bar" },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "__webpack_nonce__" variable', () => {
    // eslint-disable-next-line no-underscore-dangle
    window.__webpack_nonce__ = "12345678";

    injectStylesIntoLinkTag("./style-3.css", defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle, no-undefined
    window.__webpack_nonce__ = undefined;
  });

  it('should work with "nonce" attribute and "__webpack_nonce__" variable', () => {
    // eslint-disable-next-line no-underscore-dangle
    window.__webpack_nonce__ = "12345678";

    injectStylesIntoLinkTag("./style-4.css", {
      ...defaultOptions,
      attributes: { nonce: "87654321" },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle, no-undefined
    window.__webpack_nonce__ = undefined;
  });

  it('should work with "insert" option', () => {
    injectStylesIntoLinkTag("./style-5.css", {
      ...defaultOptions,
      insert: getInsertFn("head"),
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option #2', () => {
    injectStylesIntoLinkTag("./style-6.css", {
      ...defaultOptions,
      insert: getInsertFn("body"),
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option #3', () => {
    document.body.innerHTML =
      "<h1>Hello world</h1><iframe class='iframeTarget'/>";

    injectStylesIntoLinkTag("./style-7.css", {
      ...defaultOptions,
      insert: getInsertFn("iframe.iframeTarget"),
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
    expect(
      document.getElementsByClassName("iframeTarget")[0].contentDocument.head
        .innerHTML
    ).toMatchSnapshot();
  });

  it('should work with "insert" option #4', () => {
    injectStylesIntoLinkTag("./style-8.css", {
      ...defaultOptions,
      insert: insertAtTop,
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle
    window._lastElementInsertedByStyleLoader = null;
  });

  it('should work with "insert" option #5', () => {
    document.head.innerHTML =
      '<title>Title</title><script src="https://example.com/script.js" id="id"></script>';

    injectStylesIntoLinkTag("./style-9.css", {
      ...defaultOptions,
      insert: insertBeforeAt,
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle
    window._lastElementInsertedByStyleLoader = null;
  });

  it('should throw error with incorrect "insert" option', () => {
    expect(() =>
      injectStylesIntoLinkTag("./style-10.css", {
        ...defaultOptions,
        insert: getInsertFn("invalid"),
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it('should throw error with invalid "insert" option', () => {
    expect(() =>
      injectStylesIntoLinkTag("./style-11.css", {
        ...defaultOptions,
        insert: getInsertFn("#test><><><"),
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it("should work with updates", () => {
    const update = injectStylesIntoLinkTag("./style-12.css", defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update("./style-12.css");

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #2", () => {
    const update = injectStylesIntoLinkTag("./style-13.css", defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update("./style-14.css");

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #3", () => {
    const update = injectStylesIntoLinkTag("./style-15.css", defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #4", () => {
    const update = injectStylesIntoLinkTag("./style-16.css", {
      ...defaultOptions,
      insert: insertAtTop,
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update("./style-16.css");

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle
    window._lastElementInsertedByStyleLoader = null;
  });

  it("should work with updates #5", () => {
    document.head.innerHTML =
      '<title>Title</title><script src="https://example.com/script.js" id="id"></script>';

    const update = injectStylesIntoLinkTag("./style-17.css", {
      ...defaultOptions,
      insert: insertBeforeAt,
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update("./style-17.css");

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle
    window._lastElementInsertedByStyleLoader = null;
  });
});
