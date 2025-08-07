/**
 * Prettier v3 config for Remcura
 */

/** @type {import('prettier').Config} */
module.exports = {
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,

  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',

  vueIndentScriptAndStyle: true,
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',

  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
  ],
};
