/* eslint-env browser */

import vm from "node:vm";

import {
  compile,
  getCompiler,
  getEntryByInjectType,
  getErrors,
  getWarnings,
  readAsset,
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

  for (const injectType of injectTypes) {
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

    it(`should work when the "injectType" option is "${injectType}" with non DOM environment`, async () => {
      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(entry, { injectType });
      const stats = await compile(compiler);
      const code = readAsset("main.bundle.js", compiler, stats);
      const script = new vm.Script(code);

      let errored;

      try {
        script.runInContext(vm.createContext({ console }));
      } catch (error) {
        errored = error;
      }

      expect(errored).toBeUndefined();
      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });
  }
});
