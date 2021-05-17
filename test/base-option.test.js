import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  runInJsDom,
} from "./helpers/index";

describe('"base" option', () => {
  it("should work", async () => {
    expect.assertions(3);

    const compiler = getCompiler("./simple.js", { base: 1000 });
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });
});
