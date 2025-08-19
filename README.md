<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>Style Loader</h1>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![discussion][discussion]][discussion-url]
[![size][size]][size-url]

# style-loader

Inject CSS into the DOM.

## Getting Started

To begin, you'll need to install `style-loader`:

```console
npm install --save-dev style-loader
```

or

```console
yarn add -D style-loader
```

or

```console
pnpm add -D style-loader
```

or

```console
bun add -D style-loader
```

It's recommended to combine `style-loader` with the [`css-loader`](https://github.com/webpack-contrib/css-loader)

Then add the loader to your `webpack` configuration. For example:

**style.css**

```css
body {
  background: green;
}
```

**component.js**

```js
import "./style.css";
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

## Security Warning

This loader is primarily meant for development. The default settings are not safe for production environments. See the [recommended example configuration](#examples) and the section on [nonces](#nonce) for details.

## Options

- [**`injectType`**](#injecttype)
- [**`attributes`**](#attributes)
- [**`insert`**](#insert)
- [**`styleTagTransform`**](#styleTagTransform)
- [**`base`**](#base)
- [**`esModule`**](#esmodule)

### `injectType`

Type:

```ts
type injectType =
  | "styleTag"
  | "singletonStyleTag"
  | "autoStyleTag"
  | "lazyStyleTag"
  | "lazySingletonStyleTag"
  | "lazyAutoStyleTag"
  | "linkTag";
```

Default: `styleTag`

Allows you to setup how styles will be injected into the DOM.

Possible values:

#### `styleTag`

Automatically injects styles into the DOM using multiple `<style></style>`. It is the **default** behaviour.

**component.js**

```js
import "./styles.css";
```

Example with Locals (CSS Modules):

**component-with-css-modules.js**

```js
import * as styles from "./styles.css";

const divElement = document.createElement("div");
divElement.className = styles["my-class"];
```

All local variables (class names) are exported as named exports. To achieve this behaviour you also have to set up the `modules` option for `css-loader`. For more information, consult the `css-loader` [`documentation`](https://github.com/webpack-contrib/css-loader).

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          // The `injectType`  option can be avoided because it is default behaviour
          { loader: "style-loader", options: { injectType: "styleTag" } },
          {
            loader: "css-loader",
            // Uncomment it if you want to use CSS modules
            // options: { modules: true }
          },
        ],
      },
    ],
  },
};
```

The loader inject styles like:

```html
<style>
  .foo {
    color: red;
  }
</style>
<style>
  .bar {
    color: blue;
  }
</style>
```

#### `singletonStyleTag`

Automatically injects styles into the DOM using a single `<style></style>` tag.

> [!WARNING]
>
> Source maps do not work.

**component.js**

```js
import "./styles.css";
```

**component-with-css-modules.js**

```js
import * as styles from "./styles.css";

const divElement = document.createElement("div");
divElement.className = styles["my-class"];
```

All local variables (class names) are exported as named exports. To achieve this behaviour, you also have to set up the `modules` option for `css-loader`. For more information, consult the `css-loader` [`documentation`](https://github.com/webpack-contrib/css-loader).

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: { injectType: "singletonStyleTag" },
          },
          {
            loader: "css-loader",
            // Uncomment it if you want to use CSS modules
            // options: { modules: true }
          },
        ],
      },
    ],
  },
};
```

The loader inject styles like:

```html
<style>
  .foo {
    color: red;
  }
  .bar {
    color: blue;
  }
</style>
```

#### `autoStyleTag`

Works the same as a [`styleTag`](#styleTag), but if the code is executed in IE6-9, turns on the [`singletonStyleTag`](#singletonStyleTag) mode.

#### `lazyStyleTag`

Injects styles into the DOM using multiple `<style></style>` tags on demand.

We recommend following the `.lazy.css` naming convention for lazy styles and `.css` for basic `style-loader` usage (similar to other file types, i.e. `.lazy.less` and `.less`).

When you use the `lazyStyleTag` value, `style-loader` injects the styles lazily, making them useable on-demand via `style.use()` / `style.unuse()`.

> ⚠️ Behavior is undefined when `unuse` is called more often than `use`. Don't do that.

**component.js**

```js
import styles from "./styles.lazy.css";

styles.use();
// For removing styles you can use
// styles.unuse();
```

**component-with-css-modules.js**

```js
import styles, { "my-class" as myClass } from "./styles.lazy.css";

styles.use();

const divElement = document.createElement("div");
divElement.className = myClass;
```

All local variables (class names) are exported as named exports. To achieve this behaviour, you also have to set up the `modules` option for `css-loader`. For more information, consult the `css-loader` [`documentation`](https://github.com/webpack-contrib/css-loader).

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        exclude: /\.lazy\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.lazy\.css$/i,
        use: [
          { loader: "style-loader", options: { injectType: "lazyStyleTag" } },
          {
            loader: "css-loader",
            // Uncomment it if you want to use CSS modules
            // options: { modules: true }
          },
        ],
      },
    ],
  },
};
```

The loader inject styles like:

```html
<style>
  .foo {
    color: red;
  }
</style>
<style>
  .bar {
    color: blue;
  }
</style>
```

#### `lazySingletonStyleTag`

Injects styles into the DOM using a single `<style></style>` tag on demand.

We recommend following `.lazy.css` naming convention for lazy styles and the `.css` for basic `style-loader` usage (similar to other file types, i.e. `.lazy.less` and `.less`).

When you use the `lazySingletonStyleTag` value, `style-loader` injects the styles lazily making them useable on-demand via `style.use()` / `style.unuse()`.

> ⚠️ Source maps do not work.

> ⚠️ Behavior is undefined when `unuse` is called more often than `use`. Don't do that.

**component.js**

```js
import styles from "./styles.css";

styles.use();
// For removing styles you can use
// styles.unuse();
```

**component-with-css-modules.js**

```js
import styles, { "my-class" as myClass } from "./styles.lazy.css";

styles.use();

const divElement = document.createElement("div");
divElement.className = myClass;
```

All local variables (class names) are exported as named exports. To achieve this behaviour, you also have to set up the `modules` option for `css-loader`. For more information, consult the `css-loader` [`documentation`](https://github.com/webpack-contrib/css-loader).

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        exclude: /\.lazy\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.lazy\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: { injectType: "lazySingletonStyleTag" },
          },
          {
            loader: "css-loader",
            // Uncomment it if you want to use CSS modules
            // options: { modules: true }
          },
        ],
      },
    ],
  },
};
```

The loader generate this:

```html
<style>
  .foo {
    color: red;
  }
  .bar {
    color: blue;
  }
</style>
```

#### `lazyAutoStyleTag`

Works the same as a [`lazyStyleTag`](#lazyStyleTag), but if the code is executed in IE6-9, turns on the [`lazySingletonStyleTag`](#lazySingletonStyleTag) mode.

#### `linkTag`

Injects styles into the DOM using multiple `<link rel="stylesheet" href="path/to/file.css">` .

> ℹ️ The loader will dynamically insert the `<link href="path/to/file.css" rel="stylesheet">` tag at runtime via JavaScript. You should use [MiniCssExtractPlugin](https://webpack.js.org/plugins/mini-css-extract-plugin/) if you want to include a static `<link href="path/to/file.css" rel="stylesheet">`.

```js
import "./styles.css";
import "./other-styles.css";
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.link\.css$/i,
        use: [
          { loader: "style-loader", options: { injectType: "linkTag" } },
          { loader: "file-loader" },
        ],
      },
    ],
  },
};
```

The loader generate this:

```html
<link rel="stylesheet" href="path/to/style.css" />
<link rel="stylesheet" href="path/to/other-styles.css" />
```

### `attributes`

Type:

```ts
type attributes = HTMLAttributes;
```

Default: `{}`

If defined, the `style-loader` will attach the given attributes with their values on `<style>` / `<link>` element.

**component.js**

```js
import "./file.css";
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: "style-loader", options: { attributes: { id: "id" } } },
          { loader: "css-loader" },
        ],
      },
    ],
  },
};
```

```html
<style id="id"></style>
```

### `insert`

Type:

```ts
type insert = string;
```

Default: `head`

By default, the `style-loader` appends `<style>`/`<link>` elements to the end of the style target, which is the `<head>` tag of the page unless specified by `insert`.

This will cause CSS created by the loader to take priority over CSS already present in the target.

You can use other values if the standard behavior is not suitable for you, but we do not recommend doing this.

If you target an [iframe](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement), make sure you have sufficient access rights; the styles will be injected into the content document head.

#### `Selector`

Allows you to setup custom [query selector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) where styles are injected into the DOM.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              insert: "body",
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

#### `Absolute path to function`

Allows you to setup an absolute path to custom function that allows to override the default behavior and insert styles at any position.

> [!WARNING]
>
> Do not forget that this code will be used in the browser and not all browsers support latest ECMA features like `let`, `const`, `arrow function expression`, etc. We recommend using [`babel-loader`](https://webpack.js.org/loaders/babel-loader/) to support the latest ECMA features.

> [!WARNING]
>
> Do not forget that some DOM methods may not be available in older browsers. We recommended using only [DOM core level 2 properties](https://caniuse.com/#search=DOM%20Core), but it depends on which browsers you want to support.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              insert: require.resolve("./path-to-insert-module"),
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

New `<style>`/`<link>` elements will be inserted at the bottom of the `body` tag.

Examples:

Insert styles at top of `head` tag:

**insert-function.js**

<!-- eslint-disable -->

```js
function insertAtTop(element) {
  const parent = document.querySelector("head");

  const lastInsertedElement = window._lastElementInsertedByStyleLoader;

  if (!lastInsertedElement) {
    parent.insertBefore(element, parent.firstChild);
  } else if (lastInsertedElement.nextSibling) {
    parent.insertBefore(element, lastInsertedElement.nextSibling);
  } else {
    parent.appendChild(element);
  }

  window._lastElementInsertedByStyleLoader = element;
}

module.exports = insertAtTop;
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              insert: require.resolve("./insert-function"),
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

You can pass any parameters to `style.use(options)` and this value will be passed to the `insert` and `styleTagTransform` functions.

**insert-function.js**

```js
function insertIntoTarget(element, options) {
  const parent = options.target || document.head;

  parent.appendChild(element);
}

module.exports = insertIntoTarget;
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "lazyStyleTag",
              // Do not forget that this code will be used in the browser and
              // not all browsers support latest ECMA features like `let`, `const`, `arrow function expression` and etc,
              // we recommend use only ECMA 5 features,
              // but it depends what browsers you want to support
              insert: require.resolve("./insert-function.js"),
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

Insert styles to the provided element or to the `head` tag if target isn't provided. Now you can inject styles into Shadow DOM (or any other element).

**custom-square.css**

```css
div {
  width: 50px;
  height: 50px;
  background-color: red;
}
```

**custom-square.js**

```js
import customSquareStyles from "./custom-square.css";

class CustomSquare extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    const divElement = document.createElement("div");

    divElement.textContent = "Text content.";

    this.shadowRoot.appendChild(divElement);

    customSquareStyles.use({ target: this.shadowRoot });

    // You can override injected styles
    const bgPurple = new CSSStyleSheet();
    const width = this.getAttribute("w");
    const height = this.getAttribute("h");

    bgPurple.replace(`div { width: ${width}px; height: ${height}px; }`);

    this.shadowRoot.adoptedStyleSheets = [bgPurple];

    // `divElement` will have `100px` width, `100px` height and `red` background color
  }
}

customElements.define("custom-square", CustomSquare);

export default CustomSquare;
```

### `styleTagTransform`

Type:

```ts
type styleTagTransform = string;
```

Default: `undefined`

#### `string`

Allows you to setup an absolute path to a custom function that allows to override default `styleTagTransform` behavior.

> [!WARNING]
>
> Do not forget that this code will be used in the browser and not all browsers support latest ECMA features like `let`, `const`, `arrow function expression`, etc. We recommend use only ECMA 5 features, but it depends on which browsers you want to support.

> [!WARNING]
>
> Do not forget that some DOM methods may not be available in older browsers. We recommended using only [DOM core level 2 properties](https://caniuse.com/#search=DOM%20Core), but it depends on which browsers you want to support.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "styleTag",
              styleTagTransform: require.resolve("style-tag-transform-code"),
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

### `base`

```ts
type base = number;
```

This setting is primarily used as a workaround for [CSS clashes](https://github.com/webpack-contrib/style-loader/issues/163) when using one or more [DllPlugin](https://robertknight.me.uk/posts/webpack-dll-plugins/)s.
`base` allows you to prevent either the _app_'s CSS (or _DllPlugin2_'s css) from overwriting _DllPlugin1_'s CSS by specifying a CSS module ID base that is greater than the range used by _DllPlugin1_ e.g.:

**webpack.dll1.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

**webpack.dll2.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: "style-loader", options: { base: 1000 } },
          "css-loader",
        ],
      },
    ],
  },
};
```

**webpack.app.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: "style-loader", options: { base: 2000 } },
          "css-loader",
        ],
      },
    ],
  },
};
```

### `esModule`

Type:

```ts
type esModule = boolean;
```

Default: `true`

By default, `style-loader` generates JS modules that use the ES modules syntax.

There are some cases in which using ES modules is beneficial, such as in the case of [module concatenation](https://webpack.js.org/plugins/module-concatenation-plugin/) and [tree shaking](https://webpack.js.org/guides/tree-shaking/).

You can enable a CommonJS module syntax using:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "style-loader",
        options: {
          esModule: false,
        },
      },
    ],
  },
};
```

## Examples

### Recommended

For `production` builds, it's recommended to extract the CSS from your bundle to enable parallel loading of CSS/JS resources later on.
This can be achieved by using the [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin), because it creates separate CSS files.
For `development` mode (including `webpack-dev-server`), you can use `style-loader`, because it injects CSS into the DOM using multiple `<style></style>` tags and works faster.

> [!WARNING]
>
> Do not use `style-loader` and `mini-css-extract-plugin` together.

**webpack.config.js**

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [devMode ? [] : [new MiniCssExtractPlugin()]].flat(),
};
```

### Named export for CSS Modules

> [!WARNING]
>
> It is not allowed to use JavaScript reserved words in CSS class names.

> [!WARNING]
>
> Options `esModule` and `modules.namedExport` in `css-loader` should be enabled (by default for `css-loader@7` it is true).

**styles.css**

```css
.fooBaz {
  color: red;
}
.bar {
  color: blue;
}
.my-class {
  color: green;
}
```

**index.js**

```js
import { bar, fooBaz, "my-class" as myClass } from "./styles.css";

console.log(fooBaz, bar, myClass);
```

Or:

**index.js**

```js
import * as styles from "./styles.css";

console.log(styles.fooBaz, styles.bar, styles["my-class"]);
```

You can enable an ES module named export using:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                namedExport: true,
              },
            },
          },
        ],
      },
    ],
  },
};
```

### Source maps

The loader automatically injects source maps when the previous loader emits them.

Therefore, to generate source maps, set the `sourceMap` option to `true` for the previous loader.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          { loader: "css-loader", options: { sourceMap: true } },
        ],
      },
    ],
  },
};
```

### Nonce

If you are using a [Content Security Policy](https://www.w3.org/TR/CSP3/) (CSP), the injected code will usually be blocked. A workaround is to use a nonce. Note, however, that using a nonce significantly reduces the protection provided by the CSP. You can read more about the security impact in [the specification](https://www.w3.org/TR/CSP3/#security-considerations). The better solution is not to use this loader in production.

There are two ways to work with `nonce`:

- Using the `attributes` option
- Using the `__webpack_nonce__` variable

> [!WARNING]
>
> the `attributes` option takes precedence over the `__webpack_nonce__` variable

#### `attributes`

**component.js**

```js
import "./style.css";
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              attributes: {
                nonce: "12345678",
              },
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

The loader generate:

```html
<style nonce="12345678">
  .foo {
    color: red;
  }
</style>
```

#### `__webpack_nonce__`

**create-nonce.js**

```js
__webpack_nonce__ = "12345678";
```

**component.js**

```js
import "./create-nonce.js";
import "./style.css";
```

Alternative example for `require`:

**component.js**

```js
__webpack_nonce__ = "12345678";

require("./style.css");
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

The loader generate:

```html
<style nonce="12345678">
  .foo {
    color: red;
  }
</style>
```

#### Insert styles at top

Insert styles at top of `head` tag.

**insert-function.js**

<!-- eslint-disable -->

```js
function insertAtTop(element) {
  const parent = document.querySelector("head");
  const lastInsertedElement = window._lastElementInsertedByStyleLoader;

  if (!lastInsertedElement) {
    parent.insertBefore(element, parent.firstChild);
  } else if (lastInsertedElement.nextSibling) {
    parent.insertBefore(element, lastInsertedElement.nextSibling);
  } else {
    parent.appendChild(element);
  }

  window._lastElementInsertedByStyleLoader = element;
}

module.exports = insertAtTop;
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              insert: require.resolve("./insert-function.js"),
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

#### Insert styles before target element

Inserts styles before `#id` element.

**insert-function.js**

<!-- eslint-disable -->

```js
function insertBeforeAt(element) {
  const parent = document.querySelector("head");
  const target = document.querySelector("#id");

  const lastInsertedElement = window._lastElementInsertedByStyleLoader;

  if (!lastInsertedElement) {
    parent.insertBefore(element, target);
  } else if (lastInsertedElement.nextSibling) {
    parent.insertBefore(element, lastInsertedElement.nextSibling);
  } else {
    parent.appendChild(element);
  }

  window._lastElementInsertedByStyleLoader = element;
}

module.exports = insertBeforeAt;
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              insert: require.resolve("./insert-function.js"),
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

#### Custom Elements (Shadow DOM)

You can define custom target for your styles when using the `lazyStyleTag` type.

**insert-function.js**

```js
function insertIntoTarget(element, options) {
  const parent = options.target || document.head;

  parent.appendChild(element);
}

module.exports = insertIntoTarget;
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "lazyStyleTag",
              // Do not forget that this code will be used in the browser and
              // not all browsers support latest ECMA features like `let`, `const`, `arrow function expression` and etc,
              // we recommend use only ECMA 5 features,
              // but it is depends what browsers you want to support
              insert: require.resolve("./insert-function.js"),
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

Insert styles to the provided element, or into the `head` tag if the target isn't provided.

**custom-square.css**

```css
div {
  width: 50px;
  height: 50px;
  background-color: red;
}
```

**custom-square.js**

```js
import customSquareStyles from "./custom-square.css";

class CustomSquare extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    const divElement = document.createElement("div");

    divElement.textContent = "Text content.";

    this.shadowRoot.appendChild(divElement);

    customSquareStyles.use({ target: this.shadowRoot });

    // You can override injected styles
    const bgPurple = new CSSStyleSheet();
    const width = this.getAttribute("w");
    const height = this.getAttribute("h");

    bgPurple.replace(`div { width: ${width}px; height: ${height}px; }`);

    this.shadowRoot.adoptedStyleSheets = [bgPurple];

    // `divElement` will have `100px` width, `100px` height and `red` background color
  }
}

customElements.define("custom-square", CustomSquare);

export default CustomSquare;
```

## Contributing

We welcome all contributions!
If you're new here, please take a moment to review our contributing guidelines before submitting issues or pull requests.

[CONTRIBUTING](./.github/CONTRIBUTING.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/style-loader.svg
[npm-url]: https://npmjs.com/package/style-loader
[node]: https://img.shields.io/node/v/style-loader.svg
[node-url]: https://nodejs.org
[tests]: https://github.com/webpack-contrib/style-loader/workflows/style-loader/badge.svg
[tests-url]: https://github.com/webpack-contrib/style-loader/actions
[cover]: https://codecov.io/gh/webpack-contrib/style-loader/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/style-loader
[discussion]: https://img.shields.io/github/discussions/webpack/webpack
[discussion-url]: https://github.com/webpack/webpack/discussions
[size]: https://packagephobia.now.sh/badge?p=style-loader
[size-url]: https://packagephobia.now.sh/result?p=style-loader
