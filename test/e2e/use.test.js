/* eslint-disable */
import path from 'path';
import dom from '../helpers/dom';
import webpack from '../helpers/compiler';

describe('E2E', () => {
  test('Use', async () => {
    const config = {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: path.resolve(__dirname, '../../src/use') },
            {
              loader: 'css-loader',
              options: {
                modules: true
              }
            }
          ]
        }
      ]
    };

    const stats = await webpack('use/fixture.js', config);
    const { assets } = stats.compilation;

    const scripts = {
      main: assets['main.js'].source(),
      runtime: assets['runtime.js'].source()
    };

    const { window } = dom([ scripts.runtime, scripts.main ]);

    const styles = window.document.head.innerHTML.trim();

    expect(styles).toMatchSnapshot();
  });
});
