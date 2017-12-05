/* eslint-disable */
import path from 'path';
import webpack from './helpers/compiler';

describe('Loader', () => {
  test('Style', async () => {
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
    };

    const stats = await webpack('fixture.js', config);
    const { source } = stats.toJson().modules[3];

    expect(source).toMatchSnapshot();
  });
});
