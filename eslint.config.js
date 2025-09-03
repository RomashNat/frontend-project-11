import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins:
      { js }, extends:
      ['js/recommended'],
    languageOptions:
      { globals: globals.browser },
    ignores: [
      'dist/**', // игнорируем скомпилированные файлы
      'node_modules/**', // игнорируем зависимости
      'build/**', // игнорируем билды
    ],
  },
])
