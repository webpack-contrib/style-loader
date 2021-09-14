/* eslint-env browser */

import {
  compile,
  getCompiler,
  getEntryByInjectType,
  getErrors,
  getWarnings,
  runInJsDom,
} from "./helpers/index";

describe("lazyStyleTag options", () => {
  it(`should pass "options" to "insert" function`, async () => {
    expect.assertions(3);

    const entry = getEntryByInjectType("options.js", "lazyStyleTag");
    const compiler = getCompiler(entry, {
      injectType: "lazyStyleTag",
      insert: (styleTag, options) => {
        options.insertInto.appendChild(styleTag);
      },
    });
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it(`should pass "options" to "insert" function and unuse`, async () => {
    expect.assertions(3);

    const entry = getEntryByInjectType("options-use-unuse.js", "lazyStyleTag");
    const compiler = getCompiler(entry, {
      injectType: "lazyStyleTag",
      insert: (styleTag, options) => {
        options.insertInto.appendChild(styleTag);
      },
    });
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it(`should pass "options" to "styleTagTransform" function`, async () => {
    expect.assertions(3);

    const entry = getEntryByInjectType("options.js", "lazyStyleTag");
    const compiler = getCompiler(entry, {
      injectType: "lazyStyleTag",
      styleTagTransform: (css, styleTag, options) => {
        // eslint-disable-next-line no-param-reassign
        styleTag.innerHTML = `${css}\n${options.additionalStyles}\n`;
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
