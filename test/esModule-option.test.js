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

  const moduleTypes = ['commonjs-modules.js', 'es-modules.js'];

  const esModuleValues = [
    // No CSS modules  
    { styleLoader: {}, cssLoader: {} },
    { styleLoader: { esModules: false }, cssLoader: { esModules: false } },
    { styleLoader: { esModules: true }, cssLoader: { esModules: false } },
    { styleLoader: { esModules: false }, cssLoader: { esModules: true } },
    { styleLoader: { esModules: true }, cssLoader: { esModules: true } },
    { styleLoader: {}, cssLoader: { modules: false } },
      
    // CSS modules
    { styleLoader: {}, cssLoader: { modules: true } },
    { styleLoader: {}, cssLoader: { modules: { namedExport: false } } },
    { styleLoader: {}, cssLoader: { modules: { namedExport: true } } },
    { styleLoader: { esModules: false }, cssLoader: { esModules: false, modules: { namedExport: false } } },
    { styleLoader: { esModules: true }, cssLoader: { esModules: false, modules: { namedExport: false } } },
    { styleLoader: { esModules: false }, cssLoader: { esModules: true, modules: { namedExport: false } } },
    { styleLoader: { esModules: true }, cssLoader: { esModules: true, modules: { namedExport: false } } },
    { styleLoader: { esModules: false }, cssLoader: { esModules: false, modules: { namedExport: true } } },
    { styleLoader: { esModules: true }, cssLoader: { esModules: false, modules: { namedExport: true } } },
    { styleLoader: { esModules: false }, cssLoader: { esModules: true, modules: { namedExport: true } } },
    { styleLoader: { esModules: true }, cssLoader: { esModules: true, modules: { namedExport: true } } },
  ];

  injectTypes.forEach((injectType) => {
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
                      options: esModuleValue.styleLoader,
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

          // TODO test using global variable
          // expect(exports).toMatchSnapshot("exports");
        });

        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });
    });
  });
});
