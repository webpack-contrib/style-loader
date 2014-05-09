# style loader for webpack

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

### Simple API

``` javascript
require("style!raw!./file.css");
// => add rules in file.css to document
```

It's recommended to combine it with the [`css-loader`](https://github.com/webpack/css-loader): `require("style!css!./file.css")`.

Specify a priority to ensure that higher-priority stylesheets are applied before lower-priority stylesheets (default priority is 0):

```javascript
require("style?priority=1!css!./theme.css");
require("style!css!./default.css");

// theme.css will be applied after default.css
```

It's also possible to add a URL instead of a css string:

``` javascript
require("style/url!file!./file.css");
// => add a <link rel="stlyesheet"> to file.css to document
```

### Reference-counted API

``` javascript
var style = require("style/useable!css!./file.css");
style.use(); // = style.ref();
style.unuse(); // = style.unref();
```

Styles are not added on require, but instead on call to `use`/`ref`. Styles are removed from page if `unuse`/`unref` is called exactly as often as `use`/`ref`.

Note: Behavior is undefined when `unuse`/`unref` is called more often than `use`/`ref`. Don't do that.

## Recommended configuration

By convention the reference-counted API should be bound to `.useable.css` and the simple API to `.css` (similar to other file types, i. e. `.useable.less` and `.less`).

So the recommended configuration for webpack is:

``` javascript
{
  module: {
    loaders: [
      { test: /\.css$/, exclude: /\.useable\.css$/, loader: "style!css" },
      { test: /\.useable\.css$/, loader: "style/useable!css" }
    ]
  }
}
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
