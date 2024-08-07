/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-airbnb',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  ignorePatterns: ['vite.config.mts'],
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: {
      jsx: false
    }
  },
  rules: {
    'no-undef': 'off',
    'import/prefer-default-export': 'off',
    'no-unused-vars': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'vue/multi-word-component-names': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'no-use-before-define': 'off',
    'no-param-reassign': ['error', { props: false }],
    'vue/require-default-prop': 'off',
    'consistent-return': 'off',
    radix: 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/mouse-events-have-key-events': 'off',
    'no-restricted-exports': [
      'error',
      { restrictDefaultExports: { defaultFrom: false } }
    ],
    'no-console': ['error', { allow: ['error'] }],
    'guard-for-in': 'off'
  }
}
