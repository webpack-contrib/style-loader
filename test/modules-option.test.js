import path from "path";

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  runInJsDom,
} from "./helpers/index";

describe('"modules" option', () => {
  const injectTypes = [
    "styleTag",
    "singletonStyleTag",
    "lazyStyleTag",
    "lazySingletonStyleTag",
  ];

  injectTypes.forEach((injectType) => {
    it(`should work with the "${injectType}" inject type`, async () => {
      expect.assertions(3);

      const compiler = getCompiler(
        "./named-export.js",
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
  });
});
