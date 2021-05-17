import path from "path";

import webpack from "webpack";
import { createFsFromVolume, Volume } from "memfs";

export default (fixture, loaderOptions = {}, config = {}) => {
  const fullConfig = {
    mode: "development",
    devtool: config.devtool || false,
    context: path.resolve(__dirname, "../fixtures"),
    entry: path.resolve(__dirname, "../fixtures", fixture),
    output: {
      path: path.resolve(__dirname, "../outputs"),
      filename: "[name].bundle.js",
      chunkFilename: "[name].chunk.js",
      publicPath: "",
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            {
              loader: path.resolve(__dirname, "../../src/cjs.js"),
              options: loaderOptions || {},
            },
            loaderOptions &&
            loaderOptions.injectType &&
            loaderOptions.injectType === "linkTag"
              ? {
                  loader: "file-loader",
                  // TODO buggy on windows
                  options: { name: "[path][name].[ext]" },
                }
              : { loader: "css-loader" },
          ],
        },
      ],
    },
    plugins: [],
    ...config,
  };

  const compiler = webpack(fullConfig);

  if (!config.outputFileSystem) {
    compiler.outputFileSystem = createFsFromVolume(new Volume());
  }

  return compiler;
};
