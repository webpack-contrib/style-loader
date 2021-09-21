// Commands:
// SOURCE_MAP=yes npm run test:manual
const ENABLE_SOURCE_MAP =
  typeof process.env.SOURCE_MAP !== "undefined"
    ? Boolean(process.env.SOURCE_MAP)
    : false;

const ENABLE_ES_MODULE =
  typeof process.env.ES_MODULE !== "undefined"
    ? Boolean(process.env.ES_MODULE)
    : true;

const ENABLE_PREVIOUS_ES_MODULE =
  typeof process.env.PREVIOUS_ES_MODULE !== "undefined"
    ? Boolean(process.env.PREVIOUS_ES_MODULE)
    : true;

module.exports = {
  devtool: ENABLE_SOURCE_MAP ? "source-map" : false,
  mode: "development",
  output: {
    publicPath: "/dist/",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        exclude: [
          /\.module\.css$/i,
          /\.lazy\.css$/i,
          /\.lazy\.module\.css$/i,
          /\.link\.css$/i,
          /\.custom\.css$/i,
        ],
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: {
              esModule: ENABLE_ES_MODULE,
              // injectType: 'singletonStyleTag',
            },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: ENABLE_SOURCE_MAP,
              esModule: ENABLE_PREVIOUS_ES_MODULE,
            },
          },
        ],
      },
      {
        test: /\.module\.css$/i,
        exclude: [
          /\.lazy\.css$/i,
          /\.link\.css$/i,
          /\.lazy\.module\.css$/i,
          /\.named-export\.module\.css$/i,
          /\.named-export\.lazy\.module\.css$/i,
        ],
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: { esModule: ENABLE_ES_MODULE },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: ENABLE_SOURCE_MAP,
              esModule: ENABLE_PREVIOUS_ES_MODULE,
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.lazy\.css$/i,
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: { injectType: "lazyStyleTag", esModule: ENABLE_ES_MODULE },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: ENABLE_SOURCE_MAP,
              esModule: ENABLE_PREVIOUS_ES_MODULE,
            },
          },
        ],
      },
      {
        test: /\.custom\.css$/i,
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: {
              injectType: "lazyStyleTag",
              esModule: ENABLE_ES_MODULE,
              insert: function insert(element, options) {
                // eslint-disable-next-line
                var parent = options.target || document.head;

                parent.appendChild(element);
              },
            },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: ENABLE_SOURCE_MAP,
              esModule: ENABLE_PREVIOUS_ES_MODULE,
            },
          },
        ],
      },

      {
        test: /\.lazy\.module\.css$/i,
        exclude: [/\.named-export\.lazy\.module\.css$/i],
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: { injectType: "lazyStyleTag", esModule: ENABLE_ES_MODULE },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: ENABLE_SOURCE_MAP,
              esModule: ENABLE_PREVIOUS_ES_MODULE,
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.link\.css$/i,
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: { injectType: "linkTag", esModule: ENABLE_ES_MODULE },
          },
          {
            loader: "file-loader",
            options: { esModule: ENABLE_PREVIOUS_ES_MODULE },
          },
        ],
      },
      {
        test: /\.scss$/i,
        exclude: /\.lazy\.scss$/i,
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: { esModule: ENABLE_ES_MODULE },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: ENABLE_SOURCE_MAP,
              esModule: ENABLE_PREVIOUS_ES_MODULE,
            },
          },
          {
            loader: "sass-loader",
            options: {
              // eslint-disable-next-line global-require
              implementation: require("sass"),
              sourceMap: ENABLE_SOURCE_MAP,
            },
          },
        ],
      },
      {
        test: /\.lazy\.scss$/i,
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: { injectType: "lazyStyleTag", esModule: ENABLE_ES_MODULE },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: ENABLE_SOURCE_MAP,
              esModule: ENABLE_PREVIOUS_ES_MODULE,
            },
          },
          {
            loader: "sass-loader",
            options: {
              // eslint-disable-next-line global-require
              implementation: require("sass"),
              sourceMap: ENABLE_SOURCE_MAP,
            },
          },
        ],
      },
      {
        test: /\.named-export\.module\.css$/i,
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: {
              esModule: true,
            },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: ENABLE_SOURCE_MAP,
              esModule: true,
              modules: {
                namedExport: true,
              },
            },
          },
        ],
      },
      {
        test: /\.named-export\.lazy\.module\.css$/i,
        use: [
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: {
              injectType: "lazyStyleTag",
              esModule: true,
            },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: ENABLE_SOURCE_MAP,
              esModule: true,
              modules: {
                namedExport: true,
              },
            },
          },
        ],
      },
      {
        test: /\.png$/i,
        type: "asset/resource",
      },
    ],
  },
  devServer: {
    hot: true,
    liveReload: false,
    static: __dirname,
  },
};
