import path from "path";

import {
  compile,
  getCompiler,
  getEntryByInjectType,
  getErrors,
  getWarnings,
  runInJsDom,
} from "./helpers/index";

describe('"esModule" option', () => {
  const injectTypes = [
    "styleTag",
    "singletonStyleTag",
    "lazyStyleTag",
    "lazySingletonStyleTag",
    "linkTag",
  ];

  const esModuleValues = ["not specified", true, false, "named"];

  const commonjsExports = {
    styleTag: "module.exports = content.locals || {}",
    singletonStyleTag: "module.exports = content.locals || {}",
    lazyStyleTag: "module.exports = exported",
    lazySingletonStyleTag: "module.exports = exported",
  };

  injectTypes.forEach((injectType) => {
    const commonjsExport = commonjsExports[injectType];

    esModuleValues.forEach((esModuleValue) => {
      const isNamedExport =
        esModuleValue === "named" && injectType !== "linkTag";

      let testName = "should work";
      testName += `${
        esModuleValue === "not specified"
          ? " when not specified"
          : isNamedExport
          ? " when modules enabled"
          : esModuleValue === true
          ? ' with a value equal to "true"'
          : esModuleValue === false
          ? ` with a value equal to "false"`
          : ""
      }`;
      testName += ` and when the "injectType" option is "${injectType}"`;

      if (isNamedExport) {
        it(`${testName} and namedExport is "true"`, async () => {
          const compiler = getCompiler(
            "./es-modules.js",
            {},
            {
              module: {
                rules: [
                  {
                    test: /\.css$/i,
                    use: [
                      {
                        loader: path.resolve(__dirname, "../src/cjs.js"),
                        options: {
                          injectType,
                          esModule: true,
                        },
                      },
                      {
                        loader: "css-loader",
                        options: {
                          modules: {
                            namedExport: true,
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

        it(`${testName} and namedExport is "true" and exportOnlyLocals in css-loader enabled`, async () => {
          const compiler = getCompiler(
            "./es-modules.js",
            {},
            {
              module: {
                rules: [
                  {
                    test: /\.css$/i,
                    use: [
                      {
                        loader: path.resolve(__dirname, "../src/cjs.js"),
                        options: {
                          injectType,
                          esModule: true,
                        },
                      },
                      {
                        loader: "css-loader",
                        options: {
                          modules: {
                            namedExport: true,
                            exportOnlyLocals: true,
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

        it(`${testName} and namedExport is "false"`, async () => {
          const compiler = getCompiler(
            "./es-modules.js",
            {},
            {
              module: {
                rules: [
                  {
                    test: /\.css$/i,
                    use: [
                      {
                        loader: path.resolve(__dirname, "../src/cjs.js"),
                        options: {
                          injectType,
                          esModule: true,
                        },
                      },
                      {
                        loader: "css-loader",
                        options: {
                          modules: {
                            namedExport: false,
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

        return;
      }

      it(`${testName}`, async () => {
        const entry = getEntryByInjectType("es-modules.js", injectType);
        const compiler = getCompiler(entry, { injectType });
        const stats = await compile(compiler);

        runInJsDom("main.bundle.js", compiler, stats, (dom) => {
          expect(dom.serialize()).toMatchSnapshot("DOM");
        });

        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`${testName} and ES module syntax used`, async () => {
        const entry = getEntryByInjectType("es-modules.js", injectType);
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
                      options: { injectType, esModule: true },
                    },
                    injectType === "linkTag"
                      ? {
                          loader: "file-loader",
                          options: {
                            esModule: true,
                            name: "[path][name].[ext]",
                          },
                        }
                      : { loader: "css-loader", options: { esModule: true } },
                  ],
                },
              ],
            },
          }
        );
        const stats = await compile(compiler);

        runInJsDom("main.bundle.js", compiler, stats, (dom, bundle) => {
          expect(dom.serialize()).toMatchSnapshot("DOM");

          if (commonjsExport) {
            expect(bundle).not.toEqual(expect.stringContaining(commonjsExport));
          }
        });

        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`${testName} and CommonJS module syntax used`, async () => {
        const entry = getEntryByInjectType("es-modules.js", injectType);
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
                      options: { injectType, esModule: true },
                    },
                    injectType === "linkTag"
                      ? {
                          loader: "file-loader",
                          options: {
                            esModule: false,
                            name: "[path][name].[ext]",
                          },
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

        runInJsDom("main.bundle.js", compiler, stats, (dom, bundle) => {
          expect(dom.serialize()).toMatchSnapshot("DOM");

          if (commonjsExport) {
            expect(bundle).not.toEqual(expect.stringContaining(commonjsExport));
          }
        });

        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });
    });
  });
});
