import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: { ...globals.node, Bun: 'readonly' } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
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
