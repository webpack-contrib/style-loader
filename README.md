# style loader for webpack

## Usage

``` javascript
require("style!raw!./file.css");
// => add rules in file.css to document
```

It's recommended to combine it with the [`css`](https://github.com/webpack/css-loader) loader: `require("style!css!./file.css")`.

It also possible to add a URL instead of a css string:

``` javascript
require("style/url!file!./file.css");
// => add a <link rel="stlyesheet"> to file.css to document
```

### Dispose

You may choose to unload the loaded style.

A dispose function is exported as `dispose`.

``` javascript
var style = require("style!raw!./file.css");
// => add rules in file.css to document

// ...

// unload/dispose the style-sheet
style.dispose();
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
