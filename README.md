[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![chat][chat]][chat-url]

<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>Style Loader</h1>
  <p>Adds CSS to the DOM by injecting a <code>&lt;style&gt;</code> tag</p>
</div>

<h2 align="center">Install</h2>

```bash
npm install style-loader --save-dev
```

<h2 align="center"><a href="https://webpack.js.org/concepts/loaders">Usage</a></h2>

It's recommended to combine `style-loader` with the [`css-loader`](https://github.com/webpack/css-loader)

**component.js**
```js
import style from './file.css'
```

**webpack.config.js**
```js
{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      }
    ]
  }
}
```

#### `Locals (CSS Modules)`

When using [local scoped CSS](https://github.com/webpack/css-loader#css-scope) the module exports the generated identifiers (locals).

**component.js**
```js
import style from './file.css'

style.className === "z849f98ca812"
```

### `Url`

It's also possible to add a URL `<link href="path/to/file.css" rel="stylesheet">` instead of inlining the CSS `{String}` with `<style></style>` tag.

```js
import url from 'file.css'
```

**webpack.config.js**
```js
{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader/url" },
          { loader: "file-loader" }
        ]
      }
    ]
  }
}
```

```html
<link rel="stylesheet" href="path/to/file.css">
```

### `Useable`

By convention the `Reference Counter API` should be bound to `.useable.css` and the `.css` should be loaded with basic `style-loader` usage.(similar to other file types, i.e. `.useable.less` and `.less`).

**webpack.config.js**
```js
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
            loader: "style-loader/useable"
          },
          { loader: "css-loader" },
        ],
      },
    ],
  },
}
```

#### `Reference Counter API`

**component.js**
```js
import style from './file.css'

style.use(); // = style.ref();
style.unuse(); // = style.unref();
```

Styles are not added on `import/require()`, but instead on call to `use`/`ref`. Styles are removed from page if `unuse`/`unref` is called exactly as often as `use`/`ref`.

:warning: Behavior is undefined when `unuse`/`unref` is called more often than `use`/`ref`. Don't do that.

<h2 align="center">Options</h2>

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`hmr`**|`{Boolean}`|`true`|Enable/disable Hot Module Replacement (HMR), if disabled no HMR Code will be added (good for non local development/production)|
|**`base`** |`{Number}`|`true`|Set module ID base (DLLPlugin)|
|**`attrs`**|`{Object}`|`{}`|Add custom attrs to `<style></style>`|
|**`transform`** |`{Function}`|`false`|Transform/Conditionally load CSS by passing a transform/condition function|
|**`insertAt`**|`{String\|Object}`|`bottom`|Inserts `<style></style>` at the given position|
|**`insertInto`**|`{String}`|`<head>`|Inserts `<style></style>` into the given position|
|**`sourceMap`**|`{Boolean}`|`false`|Enable/Disable Sourcemaps|

### `hmr`

Enable/disable Hot Module Replacement (HMR), if disabled no HMR Code will be added.
This could be used for non local development and production.

**webpack.config.js**
```js
{
  loader: 'style-loader',
  options: {
    hmr: false
  }
}
```

### `base`

This setting is primarily used as a workaround for [css clashes](https://github.com/webpack-contrib/style-loader/issues/163) when using one or more [DllPlugin](https://robertknight.github.io/posts/webpack-dll-plugins/)'s.  `base` allows you to prevent either the *app*'s css (or *DllPlugin2*'s css) from overwriting *DllPlugin1*'s css by specifying a css module id base which is greater than the range used by *DllPlugin1* e.g.:

**webpack.dll1.config.js**
```js
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader'
  ]
}
```

**webpack.dll2.config.js**
```js
{
  test: /\.css$/,
  use: [
    { loader: 'style-loader', options: { base: 1000 } },
    'css-loader'
  ]
}
```

**webpack.app.config.js**
```
{
  test: /\.css$/,
  use: [
    { loader: 'style-loader', options: { base: 2000 } },
    'css-loader'
  ]
}
```

### `attrs`

If defined, style-loader will attach given attributes with their values on `<style>` / `<link>` element.

**component.js**
```js
import style from './file.css'
```

**webpack.config.js**
```js
{
  test: /\.css$/,
  use: [
    { loader: 'style-loader', options: { attrs: { id: 'id' } } }
    { loader: 'css-loader' }
  ]
}
```

```html
<style id="id"></style>
```

#### `Url`

**component.js**
```js
import link from './file.css'
```

**webpack.config.js**
```js
{
  test: /\.css$/,
  use: [
    { loader: 'style-loader/url', options: { attrs: { id: 'id' } } }
    { loader: 'file-loader' }
  ]
}
```

### `transform`

A `transform` is a function that can modify the css just before it is loaded into the page by the style-loader.
This function will be called on the css that is about to be loaded and the return value of the function will be loaded into the page instead of the original css.
If the return value of the `transform` function is falsy, the css will not be loaded into the page at all.

**webpack.config.js**
```js
{
  loader: 'style-loader',
  options: {
    transform: 'path/to/transform.js'
  }
}
```

**transform.js**
```js
module.exports = function (css) {
  // Here we can change the original css
  const transformed = css.replace('.classNameA', '.classNameB')

  return transformed
}
```

#### `Conditional`

**webpack.config.js**
```js
{
  loader: 'style-loader',
  options: {
    transform: 'path/to/conditional.js'
  }
}
```

**conditional.js**
```js
module.exports = function (css) {
  // If the condition is matched load [and transform] the CSS
  if (css.includes('something I want to check')) {
    return css;
  }
  // If a falsy value is returned, the CSS won't be loaded
  return false
}
```

### `insertAt`

By default, the style-loader appends `<style>` elements to the end of the style target, which is the `<head>` tag of the page unless specified by `insertInto`. This will cause CSS created by the loader to take priority over CSS already present in the target. To insert style elements at the beginning of the target, set this query parameter to 'top', e.g

**webpack.config.js**
```js
{
  loader: 'style-loader',
  options: {
    insertAt: 'top'
  }
}
```

A new `<style>` element can be inserted before a specific element by passing an object, e.g.

**webpack.config.js**
```js
{
  loader: 'style-loader',
  options: {
    insertAt: {
        before: '#id'
    }
  }
}
```

### `insertInto`
By default, the style-loader inserts the `<style>` elements into the `<head>` tag of the page. If you want the tags to be inserted somewhere else you can specify a CSS selector for that element here. If you target an [IFrame](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement) make sure you have sufficient access rights, the styles will be injected into the content document head.
You can also insert the styles into a [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot), e.g

**webpack.config.js**
```js
{
  loader: 'style-loader',
  options: {
    insertInto: '#host::shadow>#root'
  }
}
```

### `singleton`

If defined, the style-loader will reuse a single `<style>` element, instead of adding/removing individual elements for each required module.

> ℹ️  This option is on by default in IE9, which has strict limitations on the number of style tags allowed on a page. You can enable or disable it with the singleton option.

**webpack.config.js**
```js
{
  loader: 'style-loader',
  options: {
    singleton: true
  }
}
```

### `sourceMap`

Enable/Disable source map loading

**webpack.config.js**
```js
{
  loader: 'style-loader',
  options: {
    sourceMap: true
  }
}
```


[npm]: https://img.shields.io/npm/v/style-loader.svg
[npm-url]: https://npmjs.com/package/style-loader

[node]: https://img.shields.io/node/v/style-loader.svg
[node-url]: https://nodejs.org

[deps]: https://david-dm.org/webpack/style-loader.svg
[deps-url]: https://david-dm.org/webpack/file-loader

[chat]: https://badges.gitter.im/webpack/webpack.svg
[chat-url]: https://gitter.im/webpack/webpack
