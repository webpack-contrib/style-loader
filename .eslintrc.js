module.exports = {
  root: true,
  extends: ["@webpack-contrib/eslint-config-webpack", "prettier"],
  overrides: [
    {
      files: ["src/runtime/**/*.js"],
      env: {
        browser: true,
        node: true,
      },
      globals: {
        __webpack_nonce__: "readonly",
      },
      rules: {
        "no-underscore-dangle": "off",
        "no-plusplus": "off",
        "consistent-return": "off",
        "no-param-reassign": "off",
        camelcase: [
          "error",
          { properties: "never", allow: ["__webpack_nonce__"] },
        ],
        // avoid unnecessary `babel` helpers
        "prefer-destructuring": "off",
        "prefer-rest-params": "off",
      },
    },
  ],
};
