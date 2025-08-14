/* eslint-env browser */

import {
  compile,
  getCompiler,
  getEntryByInjectType,
  getErrors,
  getWarnings,
  runInJsDom,
} from "./helpers/index";

describe('"styleTagTransform" option', () => {
  it('should work when the "styleTagTransform" option is not specify', async () => {
    const entry = getEntryByInjectType("simple.js", "styleTag");
    const compiler = getCompiler(entry, {
      injectType: "styleTag",
    });
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work when the "styleTagTransform" option is specify', async () => {
    const entry = getEntryByInjectType("simple.js", "styleTag");
    const compiler = getCompiler(entry, {
      injectType: "styleTag",
      styleTagTransform: require.resolve("./fixtures/styleTagTransform"),
    });
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work when the "styleTagTransform" option is specify and injectType lazyStyleTag', async () => {
    const entry = getEntryByInjectType("simple.js", "lazyStyleTag");
    const compiler = getCompiler(entry, {
      injectType: "lazyStyleTag",
    });
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work when the "styleTagTransform" option is path to module and injectType lazyStyleTag', async () => {
    const entry = getEntryByInjectType("simple.js", "lazyStyleTag");
    const compiler = getCompiler(entry, {
      injectType: "lazyStyleTag",
      styleTagTransform: require.resolve("./fixtures/styleTagTransform"),
    });
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should "styleTagTransform" function path added to buildDependencies when injectType lazyStyleTag', async () => {
    const styleTagTransformFn = require.resolve("./fixtures/styleTagTransform");
    const entry = getEntryByInjectType("simple.js", "lazyStyleTag");
    const compiler = getCompiler(entry, {
      injectType: "lazyStyleTag",
      styleTagTransform: styleTagTransformFn,
    });
    const stats = await compile(compiler);
    const { buildDependencies } = stats.compilation;

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(buildDependencies.has(styleTagTransformFn)).toBe(true);
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });
});
