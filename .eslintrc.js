module.exports = {
  root: true,
  plugins: ['prettier'],
  env: {
    node: true,
    browser: true
  },
  extends: ['@webpack-contrib/eslint-config-webpack'],
  rules: {
    'prettier/prettier': ['error'],
  },
};
