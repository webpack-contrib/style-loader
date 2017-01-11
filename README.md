# style loader for webpack

Adds CSS to the DOM by injecting a `<style>` tag

## Install

```
npm install style-loader --save-dev
```

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

### Simple API

``` javascript
require("style-loader!raw-loader!./file.css");
// => add rules in file.css to document
```

It's recommended to combine it with the [`css-loader`](https://github.com/webpack/css-loader): `require("style-loader!css-loader!./file.css")`.

It's also possible to add a URL instead of a CSS string:

``` javascript
require("style-loader/url!file-loader!./file.css");
// => add a <link rel="stylesheet"> to file.css to document
```

### Local scope CSS

(experimental)

When using [local scope CSS](https://github.com/webpack/css-loader#local-scope) the module exports the generated identifiers:

``` javascript
var style = require("style-loader!css-loader!./file.css");
style.placeholder1 === "z849f98ca812bc0d099a43e0f90184"
```

### Reference-counted API

``` javascript
var style = require("style-loader/useable!css-loader!./file.css");
style.use(); // = style.ref();
style.unuse(); // = style.unref();
```

Styles are not added on `require`, but instead on call to `use`/`ref`. Styles are removed from page if `unuse`/`unref` is called exactly as often as `use`/`ref`.

Note: Behavior is undefined when `unuse`/`unref` is called more often than `use`/`ref`. Don't do that.

### Options

#### `insertAt`

By default, the style-loader appends `<style>` elements to the end of the `<head>` tag of the page. This will cause CSS created by the loader to take priority over CSS already present in the document head. To insert style elements at the beginning of the head, set this query parameter to 'top', e.g. `require('../style.css?insertAt=top')`.

#### `singleton`

If defined, the style-loader will re-use a single `<style>` element, instead of adding/removing individual elements for each required module. **Note:** this option is on by default in IE9, which has strict limitations on the number of style tags allowed on a page. You can enable or disable it with the singleton query parameter (`?singleton` or `?-singleton`).

#### `attrs`

You can use attrs options e.g.

```javascript
require('style?attrs=attr-1:[name].[ext]!css!./somefile.css');
//<style attr-1="somefile.css"></style>

require('style?attrs=attr-1:value1\\:value2!css!./somefile.css');
//<style attr-1="value1:value2"></style>

require('style?attrs[]=attr-1:[name].[ext],attrs[]=attr-2:somevalue!css!./somefile.css');
//<style attr-1="somefile.css" attr-2="somevalue"></style>
```

## Recommended configuration

By convention the reference-counted API should be bound to `.useable.css` and the simple API to `.css` (similar to other file types, i.e. `.useable.less` and `.less`).

So the recommended configuration for webpack is:

``` javascript
{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
        ],
      },
      {
        test: /\.useable\.css$/,
        use: [
          { 
            loader: "style-loader",
            options: {
              useable: true
            },
          },
          { loader: "css-loader" },
        ],
      },
    ],
  },
}
```

**Note** about source maps support and assets referenced with `url`: when style loader is used with ?sourceMap option, the CSS modules will be generated as `Blob`s, so relative paths don't work (they would be relative to `chrome:blob` or `chrome:devtools`). In order for assets to maintain correct paths setting `output.publicPath` property of webpack configuration must be set, so that absolute paths are generated.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
