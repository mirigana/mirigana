module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
    browser: true,
    webextensions: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'no-multiple-empty-lines': 0,
  },
};
