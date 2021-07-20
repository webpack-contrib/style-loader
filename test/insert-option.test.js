/* eslint-env browser */
import {
  compile,
  getCompiler,
  getEntryByInjectType,
  getErrors,
  getWarnings,
  runInJsDom,
} from "./helpers/index";

describe('"insert" option', () => {
  const injectTypes = [
    "styleTag",
    "singletonStyleTag",
    "lazyStyleTag",
    "lazySingletonStyleTag",
    "linkTag",
  ];

  injectTypes.forEach((injectType) => {
    it(`should insert styles into "head" bottom when not specified and when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, { injectType });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should insert styles into "body" bottom when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, { injectType, insert: "body" });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should insert styles into "div.target" bottom when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, { injectType, insert: "div.target" });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should insert styles into "iframe.iframeTarget" bottom when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(4);

      const selector = "iframe.iframeTarget";
      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, { injectType, insert: selector });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(
          dom.window.document.querySelector(selector).contentDocument.head
            .innerHTML
        ).toMatchSnapshot("iframe head");
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should insert styles into runtime created element bottom when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("element.js", injectType);
      const compiler = getCompiler(entry, {
        injectType,
        insert: (element) =>
          document.querySelector("#test-shadow").appendChild(element),
      });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should insert styles into "head" top when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, {
        injectType,
        insert: (element) => {
          const parent = document.querySelector("head");
          const lastInsertedElement =
            // eslint-disable-next-line no-underscore-dangle
            window._lastElementInsertedByStyleLoader;

          if (!lastInsertedElement) {
            parent.insertBefore(element, parent.firstChild);
          } else if (lastInsertedElement.nextSibling) {
            parent.insertBefore(element, lastInsertedElement.nextSibling);
          } else {
            parent.appendChild(element);
          }

          // eslint-disable-next-line no-underscore-dangle
          window._lastElementInsertedByStyleLoader = element;
        },
      });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should insert styles into "head" top when the "injectType" option is "${injectType}" and insert is object`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, {
        injectType,
        insert: require.resolve("./fixtures/insertFn.js"),
      });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should insert function added to buildDependencies when the "injectType" option is "${injectType}" and insert is object`, async () => {
      expect.assertions(4);

      const insertFn = require.resolve("./fixtures/insertFn.js");
      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, {
        injectType,
        insert: insertFn,
      });
      const stats = await compile(compiler);
      const { buildDependencies } = stats.compilation;

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(buildDependencies.has(insertFn)).toBe(true);
      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should insert styles into before "#existing-style" id when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, {
        injectType,
        insert: (element) => {
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

          // eslint-disable-next-line no-underscore-dangle
          window._lastElementInsertedByStyleLoader = element;
        },
      });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });
  });
});
