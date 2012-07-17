# style loader for webpack

## Usage

``` javascript
require("style!raw!./file.css");
// => add rules in file.css to document
```

Does nothing in node.js.

It's recommended to combine it with the [`css`](https://github.com/sokra/webpack-css-loader) loader: `require("style!css!./file.css")`.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)