const path = require('path');
const JSDOM = require('jsdom');
const webpack = require('./helpers/compiler');

describe('Loader', () => {
  test('Default', async () => {
    const config = {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: path.resolve(__dirname, '../src') },
            {
              loader: 'css-loader',
              options: {}
            }
          ]
        }
      ]
    }

    const stats = await webpack('fixture.js', config);
    const { source } = stats.toJson().modules[4];

    expect(source).toMatchSnapshot();
  })
})
