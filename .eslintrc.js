module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['tsconfig.json']
  },
  plugins: [],
  rules: {
    semi: [2, 'always'],
    '@typescript-eslint/semi': [2, 'always'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/prefer-ts-expect-error': 'off'
  }
};
