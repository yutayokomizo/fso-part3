module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 0,
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-unused-vars': ['error', { args: 'none' }],
    'consistent-return': 0,
  },
};
