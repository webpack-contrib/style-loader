const path = require('path');
const webpack = require('../helpers/compiler');

describe('Options', () => {
  describe('sourceMap', () => {
    test('{Boolean}', async () => {
      const config = {
        rules: [
          {
            test: /\.css$/,
            use: [
              {
                loader: path.resolve(__dirname, '../../src'),
                options: {
                  sourceMap: true
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          }
        ]
      }

      const stats = await webpack('fixture.js', config);
      const { source } = stats.toJson().modules[5];

      expect(source).toMatchSnapshot();
    })
  })
})
