import {
  compile,
  getCompiler,
  getEntryByInjectType,
  getErrors,
  getWarnings,
  runInJsDom,
} from "./helpers/index";

describe('"attributes" option', () => {
  const injectTypes = [
    "styleTag",
    "singletonStyleTag",
    "lazyStyleTag",
    "lazySingletonStyleTag",
    "linkTag",
  ];

  injectTypes.forEach((injectType) => {
    it(`should add attributes to tag when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, {
        injectType,
        attributes: {
          type: "text/css",
          foo: "bar",
          "data-id": "style-tag-id",
        },
      });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should apply nonce attribute when "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, {
        injectType,
        attributes: {
          nonce: "234567",
        },
      });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should add nonce attribute when "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("nonce-require.js", injectType);
      const compiler = getCompiler(entry, { injectType, esModule: false });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should add nonce attribute when "injectType" option is "${injectType}" #2`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("nonce-import.js", injectType);
      const compiler = getCompiler(entry, { injectType });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });
  });
});
