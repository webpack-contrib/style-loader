/**
 * @jest-environment jsdom
 */

/* eslint-env browser */

import injectStylesIntoStyleTag from "../../src/runtime/injectStylesIntoStyleTag";

import domAPI from "../../src/runtime/styleDomAPI";
import singletonApi from "../../src/runtime/singletonStyleDomAPI";
import insertStyleElement from "../../src/runtime/insertStyleElement";
import insertBySelector from "../../src/runtime/insertBySelector";

const getInsertFn = (place) => insertBySelector.bind(null, place);

function styleTagTransform(css, style) {
  if (style.styleSheet) {
    // eslint-disable-next-line no-param-reassign
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

function setAttributes(style, attributes = {}) {
  if (typeof attributes.nonce === "undefined") {
    const nonce =
      // eslint-disable-next-line camelcase,no-undef
      typeof __webpack_nonce__ !== "undefined" ? __webpack_nonce__ : null;

    if (nonce) {
      // eslint-disable-next-line no-param-reassign
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach((key) => {
    style.setAttribute(key, attributes[key]);
  });
}

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

const defaultOptions = {
  domAPI,
  insertStyleElement,
  insert: getInsertFn("head"),
  styleTagTransform,
  setAttributes,
};

describe("addStyle", () => {
  beforeEach(() => {
    document.head.innerHTML = "<title>Title</title>";
    document.body.innerHTML = "<h1>Hello world</h1>";
  });

  // Each query should have be unique because style-loader caching styles in dom

  it("should work", () => {
    injectStylesIntoStyleTag(
      [["./style-1.css", ".foo { color: red }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with multiple styles", () => {
    injectStylesIntoStyleTag(
      [
        ["./style-2-1.css", ".foo { color: red }", ""],
        ["./style-2-2.css", ".bar { color: blue }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with same module id in list", () => {
    injectStylesIntoStyleTag(
      [
        ["./style-3.css", ".foo { color: red }", ""],
        ["./style-3.css", ".foo { color: green }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with media", () => {
    injectStylesIntoStyleTag(
      [
        [
          "./style-4.css",
          ".foo { color: red }",
          "screen and (min-width:320px)",
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with supports", () => {
    injectStylesIntoStyleTag(
      [
        [
          "./style-4.css",
          ".foo { color: red }",
          "",
          // eslint-disable-next-line no-undefined
          undefined,
          "display: flex",
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with layer", () => {
    injectStylesIntoStyleTag(
      // eslint-disable-next-line no-undefined
      [["./style-4.css", ".foo { color: red }", "", undefined, "", "default"]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with empty layer", () => {
    injectStylesIntoStyleTag(
      // eslint-disable-next-line no-undefined
      [["./style-4.css", ".foo { color: red }", "", undefined, "", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with source maps", () => {
    injectStylesIntoStyleTag(
      [
        [
          "./style-5.css",
          ".foo { color: red }",
          "",
          {
            version: 3,
            sources: ["style-5.css"],
            names: [],
            mappings: "AAAA,cAAqB,eAAe,EAAE",
            file: "style-5.css",
            sourcesContent: [".foo { color: red }"],
          },
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "__webpack_nonce__" variable', () => {
    // eslint-disable-next-line no-underscore-dangle
    window.__webpack_nonce__ = "12345678";

    injectStylesIntoStyleTag(
      [["./style-6.css", ".foo { color: red }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle, no-undefined
    window.__webpack_nonce__ = undefined;
  });

  it('should work with "nonce" attribute and "__webpack_nonce__" variable', () => {
    // eslint-disable-next-line no-underscore-dangle
    window.__webpack_nonce__ = "12345678";

    injectStylesIntoStyleTag([["./style-7.css", ".foo { color: red }", ""]], {
      ...defaultOptions,
      attributes: { nonce: "87654321" },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle, no-undefined
    window.__webpack_nonce__ = undefined;
  });

  it('should work with "base" option', () => {
    injectStylesIntoStyleTag([["./style-8.css", ".foo { color: red }", ""]], {
      ...defaultOptions,
      base: 1000,
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attributes" option', () => {
    injectStylesIntoStyleTag([["./style-9.css", ".foo { color: red }", ""]], {
      ...defaultOptions,
      attributes: { foo: "bar" },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attributes" option #2', () => {
    injectStylesIntoStyleTag(
      [
        ["./style-10-1.css", ".foo { color: red }", ""],
        ["./style-10-2.css", ".bar { color: blue }", ""],
      ],
      {
        ...defaultOptions,
        attributes: { foo: "bar" },
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option', () => {
    injectStylesIntoStyleTag(
      [
        ["./style-11-1.css", ".foo { color: red }", ""],
        ["./style-11-2.css", ".bar { color: blue }", ""],
      ],
      {
        ...defaultOptions,
        insert: getInsertFn("head"),
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option #2', () => {
    injectStylesIntoStyleTag(
      [
        ["./style-12-1.css", ".foo { color: red }", ""],
        ["./style-12-2.css", ".bar { color: blue }", ""],
      ],
      {
        ...defaultOptions,
        insert: getInsertFn("body"),
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option #3', () => {
    document.body.innerHTML =
      "<h1>Hello world</h1><iframe class='iframeTarget'/>";

    injectStylesIntoStyleTag(
      [
        ["./style-13-1.css", ".foo { color: red }", ""],
        ["./style-13-2.css", ".bar { color: blue }", ""],
      ],
      {
        ...defaultOptions,
        insert: getInsertFn("iframe.iframeTarget"),
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
    expect(
      document.getElementsByClassName("iframeTarget")[0].contentDocument.head
        .innerHTML
    ).toMatchSnapshot();
  });

  it('should work with "insert" option #4', () => {
    injectStylesIntoStyleTag(
      [
        ["./style-14-1.css", ".foo { color: red }", ""],
        ["./style-14-2.css", ".bar { color: blue }", ""],
      ],
      {
        ...defaultOptions,
        insert: insertAtTop,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle
    window._lastElementInsertedByStyleLoader = null;
  });

  it('should work with "insert" option #5', () => {
    document.head.innerHTML =
      '<title>Title</title><script src="https://example.com/script.js" id="id"></script>';

    injectStylesIntoStyleTag(
      [
        ["./style-15-1.css", ".foo { color: red }", ""],
        ["./style-15-2.css", ".bar { color: blue }", ""],
      ],
      {
        ...defaultOptions,
        insert: insertBeforeAt,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option #6', () => {
    document.body.innerHTML =
      '<h1>Hello world</h1><div><div id="root"></div></div>';

    injectStylesIntoStyleTag(
      [
        ["./style-16-1.css", ".foo { color: red }", ""],
        ["./style-16-2.css", ".bar { color: blue }", ""],
      ],
      {
        ...defaultOptions,
        insert: (style) => document.querySelector("#root").appendChild(style),
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should throw error with incorrect "insert" option', () => {
    expect(() =>
      injectStylesIntoStyleTag(
        [["./style-17.css", ".foo { color: red }", ""]],
        {
          ...defaultOptions,
          insert: getInsertFn("invalid"),
        }
      )
    ).toThrowErrorMatchingSnapshot();
  });

  it('should throw error with invalid "insert" option', () => {
    expect(() =>
      injectStylesIntoStyleTag(
        [["./style-18.css", ".foo { color: red }", ""]],
        {
          ...defaultOptions,
          insert: getInsertFn("#test><><><"),
        }
      )
    ).toThrowErrorMatchingSnapshot();
  });

  it("should work with updates", () => {
    const update = injectStylesIntoStyleTag(
      [["./style-19.css", ".foo { color: red }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([["./style-19.css", ".foo { color: blue }", ""]], defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #2", () => {
    const update = injectStylesIntoStyleTag(
      [["./style-20-1.css", ".foo { color: red }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([["./style-20-2.css", ".foo { color: blue }", ""]], defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #3", () => {
    const update = injectStylesIntoStyleTag(
      [["./style-21-1.css", ".foo { color: red }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./style-21-1.css", ".foo { color: blue }", ""],
        ["./style-21-2.css", ".foo { color: red }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #4", () => {
    const update = injectStylesIntoStyleTag(
      [["./style-22.css", ".foo { color: red }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #5", () => {
    const update = injectStylesIntoStyleTag(
      [
        [
          "./style-23.css",
          ".foo { color: red }",
          "screen and (min-width:320px)",
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        [
          "./style-23.css",
          ".foo { color: blue }",
          "screen and (min-width:640px)",
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #6", () => {
    // eslint-disable-next-line no-undef
    globalThis.singletonData = {
      singleton: null,
      singletonCounter: 0,
    };

    const update = injectStylesIntoStyleTag(
      [
        ["./style-24-1.css", ".foo { color: red }", ""],
        ["./style-24-2.css", ".bar { color: yellow }", ""],
      ],
      {
        ...defaultOptions,
        domAPI: singletonApi,
        singleton: true,
      }
    );

    // eslint-disable-next-line no-undef,no-undefined
    globalThis.singletonData = undefined;

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./style-24-1.css", ".foo { color: blue }", ""],
        ["./style-24-2.css", ".bar { color: yellow }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./style-24-1.css", ".foo { color: yellow }", ""],
        [
          "./style-24-2.css",
          ".bar { color: red }",
          "screen and (min-width: 100px)",
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./style-24-1.css", ".foo { color: yellow }", ""],
        [
          "./style-24-2.css",
          ".bar { color: red }",
          "screen and (min-width: 200px)",
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./style-24-1.css", ".foo { color: red }", ""],
        [
          "./style-24-2.css",
          ".bar { color: red }",
          "screen and (min-width: 200px)",
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([["./style-24-1.css", ".foo { color: red }", ""]], defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #7", () => {
    const update = injectStylesIntoStyleTag(
      [
        ["./style-25-1.css", ".foo { color: red }", ""],
        ["./style-25-2.css", ".bar { color: blue }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./style-25-1.css", ".foo { color: green }", ""],
        ["./style-25-2.css", ".bar { color: black }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #8", () => {
    const update = injectStylesIntoStyleTag(
      [
        [
          "./style-26-1.css",
          ".foo { color: red }",
          "screen and (min-width: 320px)",
          {
            version: 3,
            sources: ["style-26-1.css"],
            names: [],
            mappings: "AAAA,cAAqB,eAAe,EAAE",
            file: "style-26-1.css",
            sourcesContent: [
              "@media screen and (max-width: 320px) { .foo { color: red } }",
            ],
          },
        ],
        [
          "./style-26-2.css",
          ".bar { color: yellow }",
          "screen and (max-width: 240px)",
          {
            version: 3,
            sources: ["style-26-2.css"],
            names: [],
            mappings: "AAAA,cAAqB,eAAe,EAAE",
            file: "style-26-2.css",
            sourcesContent: [
              "@media screen and (max-width: 240px) { .bar { color: yellow } }",
            ],
          },
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        [
          "./style-26-1.css",
          ".foo { color: black }",
          "screen and (min-width: 640px)",
          {
            version: 3,
            sources: ["style-26-1.css"],
            names: [],
            mappings: "BBBB,cAAqB,eAAe,EAAE",
            file: "style-26-1.css",
            sourcesContent: [
              "@media screen and (min-width: 640px) { .foo { color: black } }",
            ],
          },
        ],
        [
          "./style-26-2.css",
          ".bar { color: black }",
          "screen and (max-width: 1240px)",
          {
            version: 3,
            sources: ["style-26-2.css"],
            names: [],
            mappings: "BBBB,cAAqB,eAAe,EAAE",
            file: "style-26-2.css",
            sourcesContent: [
              "@media screen and (max-width: 1240px) { .bar { color: black } }",
            ],
          },
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #9", () => {
    const update = injectStylesIntoStyleTag(
      [["./style-27.css", ".foo { color: red }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./style-27.css", ".foo { color: black }", ""],
        ["./style-27.css", ".foo { color: red }", ""],
        ["./style-27.css", ".foo { color: yellow }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #10", () => {
    const update = injectStylesIntoStyleTag(
      [
        ["./style-28-1.css", ".foo { color: red }", ""],
        ["./style-28-2.css", ".bar { color: blue }", ""],
      ],
      {
        ...defaultOptions,
        insert: insertAtTop,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./style-28-1.css", ".foo { color: black }", ""],
        ["./style-28-2.css", ".bar { color: white }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle
    window._lastElementInsertedByStyleLoader = null;
  });

  it("should work with updates #11", () => {
    document.head.innerHTML =
      '<title>Title</title><script src="https://example.com/script.js" id="id"></script>';

    const update = injectStylesIntoStyleTag(
      [
        ["./style-29-1.css", ".foo { color: red }", ""],
        ["./style-29-2.css", ".bar { color: blue }", ""],
      ],
      {
        ...defaultOptions,
        insert: insertBeforeAt,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./style-29-1.css", ".foo { color: black }", ""],
        ["./style-29-2.css", ".bar { color: white }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #12", () => {
    const update = injectStylesIntoStyleTag(
      [
        ["./order-1.css", ".order { color: red }", ""],
        [
          "./order.css",
          '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
          "",
        ],
        ["./order-2.css", ".order { color: blue }", ""],
        [
          "./order.css",
          '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
          "",
        ],
        ["./order-1.css", ".order { color: red }", ""],
        [
          "./order.css",
          '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
          "",
        ],
        [
          "./order-2.css",
          ".order { color: blue }",
          "screen and (min-width: 2000px)",
        ],
        [
          "./order.css",
          '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
          "",
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update(
      [
        ["./order-1.css", ".order { color: orange }", ""],
        [
          "./order.css",
          '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
          "",
        ],
        ["./order-2.css", ".order { color: blue }", ""],
        [
          "./order.css",
          '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
          "",
        ],
        ["./order-1.css", ".order { color: orange }", ""],
        [
          "./order.css",
          '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
          "",
        ],
        [
          "./order-2.css",
          ".order { color: blue }",
          "screen and (min-width: 2000px)",
        ],
        [
          "./order.css",
          '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
          "",
        ],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #12", () => {
    const update = injectStylesIntoStyleTag(
      [
        ["./style-30.css", ".foo { color: red }", ""],
        ["./style-31.css", ".bar { color: blue }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([], defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #13", () => {
    const update1 = injectStylesIntoStyleTag(
      [["./style-32.css", ".red { color: red }", ""]],
      defaultOptions
    );
    const update2 = injectStylesIntoStyleTag(
      [["./style-33.css", ".green { color: green }", ""]],
      defaultOptions
    );
    const update3 = injectStylesIntoStyleTag(
      [["./style-34.css", ".blue { color: blue }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update1([["./style-32.css", ".red { color: black }", ""]], defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update2(
      [["./style-33.css", ".green { color: black }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update3([["./style-34.css", ".blue { color: black }", ""]], defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update1();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update2();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update3();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with updates #14", () => {
    const update1 = injectStylesIntoStyleTag(
      [["./style-35.css", ".red { color: red }", ""]],
      defaultOptions
    );
    const update2 = injectStylesIntoStyleTag(
      [["./style-36.css", ".green { color: green }", ""]],
      defaultOptions
    );
    const update3 = injectStylesIntoStyleTag(
      [["./style-37.css", ".blue { color: blue }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update2(
      [["./style-36.css", ".green { color: black }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    injectStylesIntoStyleTag(
      [["./style-38.css", ".white { color: white }", ""]],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update1();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update3();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("issue 447", () => {
    injectStylesIntoStyleTag({});

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("issue 447 #2", () => {
    const update = injectStylesIntoStyleTag({}, defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update({});

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with empty modules list", () => {
    const update = injectStylesIntoStyleTag([], defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work without modules", () => {
    const update = injectStylesIntoStyleTag();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with empty modules list #2", () => {
    const update = injectStylesIntoStyleTag(null, defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([["./style-39.css", ".foo { color: red }", ""]], defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should work with empty modules list #3", () => {
    const update = injectStylesIntoStyleTag(null, defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([["./style-40.css", ".foo { color: red }", ""]], defaultOptions);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it("should avoid duplicate modules", () => {
    injectStylesIntoStyleTag(
      [
        ["./style-41.css", ".foo { color: yellow }", ""],
        ["./style-42.css", ".bar { color: red }", ""],
      ],
      defaultOptions
    );
    injectStylesIntoStyleTag(
      [
        ["./style-41.css", ".foo { color: yellow }", ""],
        ["./style-43.css", ".baz { color: blue }", ""],
      ],
      defaultOptions
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });
});
