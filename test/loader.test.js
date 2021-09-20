/* eslint-env browser */

import path from "path";

import webpack from "webpack";

import {
  compile,
  getCompiler,
  getEntryByInjectType,
  getErrors,
  getWarnings,
  readAsset,
  runInJsDom,
} from "./helpers/index";

jest.setTimeout(10000);

describe("loader", () => {
  const injectTypes = [
    "styleTag",
    "singletonStyleTag",
    "autoStyleTag",
    "lazyStyleTag",
    "lazySingletonStyleTag",
    "lazyAutoStyleTag",
    "linkTag",
  ];

  it("should work", async () => {
    const compiler = getCompiler("./simple.js");
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

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

    it(`should work with css modules when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("css-modules.js", injectType);
      const compiler = getCompiler(
        entry,
        {},
        {
          module: {
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: path.resolve(__dirname, "../src/cjs.js"),
                    options: { injectType },
                  },
                  injectType === "linkTag"
                    ? {
                        loader: "file-loader",
                        options: { name: "[path][name].[ext]" },
                      }
                    : {
                        loader: "css-loader",
                        options: {
                          modules: {
                            localIdentName: "[name]-[local]_[hash:base64:7]",
                          },
                        },
                      },
                ],
              },
            ],
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should not inject hmr code without HotModuleReplacementPlugin when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(4);

      const compiler = getCompiler("./hot.js", { injectType });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.window.hotApi).not.toBeDefined();
      });

      const bundleSource = readAsset("main.bundle.js", compiler, stats);

      expect(bundleSource).not.toMatch(/module\.hot\.accept/);
      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should inject hmr code with HotModuleReplacementPlugin when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(4);

      const compiler = getCompiler(
        "./hot.js",
        { injectType },
        { plugins: [new webpack.HotModuleReplacementPlugin()] }
      );
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.window.hotApi).toBeDefined();
      });

      const bundleSource = readAsset("main.bundle.js", compiler, stats);

      expect(bundleSource).toMatch(/module\.hot\.accept/);
      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should not generate source maps when previous loader don't emit them when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(
        entry,
        { injectType },
        {
          devtool: "source-map",
          module: {
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: path.resolve(__dirname, "../src/cjs.js"),
                    options: { injectType },
                  },
                  injectType === "linkTag"
                    ? {
                        loader: "file-loader",
                        options: { name: "[path][name].[ext]" },
                      }
                    : {
                        loader: "css-loader",
                        options: { sourceMap: false },
                      },
                ],
              },
            ],
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    // `linkTag` doesn't generate source maps, original source should contains them
    // TODO broken on windows
    it.skip(`should generate source maps when previous loader emit them when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(
        entry,
        { injectType },
        {
          devtool: "source-map",
          module: {
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: path.resolve(__dirname, "../src/cjs.js"),
                    options: { injectType },
                  },
                  injectType === "linkTag"
                    ? {
                        loader: "file-loader",
                        options: { name: "[path][name].[ext]" },
                      }
                    : {
                        loader: "css-loader",
                        options: { sourceMap: true },
                      },
                ],
              },
            ],
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should work when the "injectType" option is "${injectType}" and ES module syntax used`, async () => {
      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(
        entry,
        { injectType },
        {
          module: {
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: path.resolve(__dirname, "../src/cjs.js"),
                    options: { injectType },
                  },
                  injectType === "linkTag"
                    ? {
                        loader: "file-loader",
                        options: { name: "[path][name].[ext]" },
                      }
                    : {
                        loader: "css-loader",
                        options: { esModule: true },
                      },
                ],
              },
            ],
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should work when the "injectType" option is "${injectType}" and CommonJS module syntax used`, async () => {
      const entry = getEntryByInjectType("simple.js", injectType);
      const compiler = getCompiler(
        entry,
        { injectType },
        {
          module: {
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: path.resolve(__dirname, "../src/cjs.js"),
                    options: { injectType },
                  },
                  injectType === "linkTag"
                    ? {
                        loader: "file-loader",
                        options: { name: "[path][name].[ext]" },
                      }
                    : {
                        loader: "css-loader",
                        options: { esModule: false },
                      },
                ],
              },
            ],
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    it(`should work when the "injectType" option is "${injectType}" and files have same name`, async () => {
      expect.assertions(3);

      const entry = getEntryByInjectType("multiple.js", injectType);
      const compiler = getCompiler(entry, { injectType });
      const stats = await compile(compiler);

      runInJsDom("main.bundle.js", compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot("DOM");
      });

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");
    });

    if (["lazyStyleTag", "lazySingletonStyleTag"].includes(injectType)) {
      it(`should work when ref is negative when the "injectType" option is "${injectType}"`, async () => {
        expect.assertions(3);

        const compiler = getCompiler("./lazy-negative-refs.js", {
          injectType,
        });
        const stats = await compile(compiler);

        runInJsDom("main.bundle.js", compiler, stats, (dom) => {
          expect(dom.serialize()).toMatchSnapshot("DOM");
        });

        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });
    }
  });
});
