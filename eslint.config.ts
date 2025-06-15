import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  skipFormatting,
  {
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
      'no-console': ['warn', { allow: ['error'] }],
      'guard-for-in': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'prefer-const': 'off',
      'no-return-assign': 'off',
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: true,
          ignores: []
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
)
