/* eslint-env browser */

import {
  compile,
  getCompiler,
  getEntryByInjectType,
  getErrors,
  getWarnings,
  runInJsDom,
} from "./helpers/index";

describe('"injectType" option', () => {
  const injectTypes = [
    "styleTag",
    "singletonStyleTag",
    "autoStyleTag",
    "lazyStyleTag",
    "lazyAutoStyleTag",
    "lazySingletonStyleTag",
    "linkTag",
  ];

  injectTypes.forEach((injectType) => {
    it(`should work when the "injectType" option is "${injectType}"`, async () => {
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
  });
});
