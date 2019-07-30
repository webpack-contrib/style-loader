const enableSourceMap =
  typeof process.env.SOURCE_MAP !== 'undefined'
    ? Boolean(process.env.SOURCE_MAP)
    : false;

module.exports = {
  mode: 'development',
  output: {
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: require.resolve('../../dist/index.js'),
            options: {
              sourceMap: enableSourceMap,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: enableSourceMap,
            },
          },
        ],
      },
      {
        test: /\.scss$/i,
        use: [
          {
            loader: require.resolve('../../dist/index.js'),
            options: {
              sourceMap: enableSourceMap,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: enableSourceMap,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // eslint-disable-next-line global-require
              implementation: require('sass'),
              sourceMap: enableSourceMap,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    hot: true,
    contentBase: __dirname,
  },
};
