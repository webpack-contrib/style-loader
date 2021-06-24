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
    "autoStyleTag",
    "lazyStyleTag",
    "lazySingletonStyleTag",
    "lazyAutoStyleTag",
    "linkTag",
  ];

  const moduleTypes = ["commonjs-modules.js", "es-modules.js"];

  const esModuleValues = [
    // No CSS modules
    { styleLoader: {}, cssLoader: {} },
    { styleLoader: { esModule: false }, cssLoader: { esModule: false } },
    { styleLoader: { esModule: true }, cssLoader: { esModule: false } },
    { styleLoader: { esModule: false }, cssLoader: { esModule: true } },
    { styleLoader: { esModule: true }, cssLoader: { esModule: true } },
    { styleLoader: {}, cssLoader: { modules: false } },

    // CSS modules
    { styleLoader: {}, cssLoader: { modules: true } },
    { styleLoader: {}, cssLoader: { modules: { namedExport: false } } },
    { styleLoader: {}, cssLoader: { modules: { namedExport: true } } },
    {
      styleLoader: { esModule: false },
      cssLoader: { esModule: false, modules: { namedExport: false } },
    },
    {
      styleLoader: { esModule: true },
      cssLoader: { esModule: false, modules: { namedExport: false } },
    },
    {
      styleLoader: { esModule: false },
      cssLoader: { esModule: true, modules: { namedExport: false } },
    },
    {
      styleLoader: { esModule: true },
      cssLoader: { esModule: true, modules: { namedExport: false } },
    },

    {
      styleLoader: { esModule: false },
      cssLoader: { esModule: true, modules: { namedExport: true } },
    },
    {
      styleLoader: { esModule: true },
      cssLoader: { esModule: true, modules: { namedExport: true } },
    },

    // exportOnlyLocals should not lead to error
    {
      styleLoader: { esModule: true },
      cssLoader: {
        esModule: true,
        modules: { namedExport: true, exportOnlyLocals: true },
      },
    },
    {
      styleLoader: { esModule: true },
      cssLoader: {
        esModule: true,
        modules: { namedExport: false, exportOnlyLocals: true },
      },
    },
  ];

  injectTypes.forEach((injectType) => {
    esModuleValues.forEach((esModuleValue) => {
      moduleTypes.forEach((moduleType) => {
        let testName = "";

        testName += `CONFIG: ${JSON.stringify(esModuleValue)},`;

        testName += ` MODULE_TYPE: "${moduleType.split(".")[0]}",`;

        testName += ` INJECT_TYPE: "${injectType}"`;

        it(`${testName}`, async () => {
          const entry = getEntryByInjectType(moduleType, injectType);
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
                        options: {
                          injectType,
                          ...esModuleValue.styleLoader,
                        },
                      },
                      injectType === "linkTag"
                        ? {
                            loader: "file-loader",
                            options: {
                              esModule: true,
                              name: "[path][name].[ext]",
                            },
                          }
                        : {
                            loader: "css-loader",
                            options: esModuleValue.cssLoader,
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
            // eslint-disable-next-line no-underscore-dangle
            expect(dom.window.__cssLoader).toMatchSnapshot("exports");
          });

          expect(getWarnings(stats)).toMatchSnapshot("warnings");
          expect(getErrors(stats)).toMatchSnapshot("errors");
        });
      });
    });
  });
});
