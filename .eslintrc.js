module.exports = {
  root: true,
  plugins: ['prettier'],
  env: {
    node: true,
    browser: true,
  },
  extends: ['@webpack-contrib/eslint-config-webpack'],
  rules: {
    'prettier/prettier': ['error'],
    camelcase: ['error', { allow: ['__webpack_nonce__'] }],
  },
  globals: {
    DEBUG: 'readonly',
    __webpack_nonce__: 'readonly',
  },
};
