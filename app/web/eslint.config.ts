import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    files: ['client/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: '19.2' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/text-\\[\\d/]',
          message: 'Bracket font sizes are banned, use a scale rung',
        },
        {
          selector: 'TemplateElement[value.raw=/text-\\[\\d/]',
          message: 'Bracket font sizes are banned, use a scale rung',
        },
      ],
    },
  },
  {
    files: ['server/**/*.{ts,tsx}', '*.config.{ts,js}'],
    languageOptions: { globals: { ...globals.node, Bun: 'readonly' } },
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'window',
          message: 'Browser global, absent in the Bun runtime',
        },
        {
          name: 'document',
          message: 'Browser global, absent in the Bun runtime',
        },
        {
          name: 'localStorage',
          message: 'Browser global, absent in the Bun runtime',
        },
      ],
    },
  }
)
