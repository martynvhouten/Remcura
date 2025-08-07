// Deprecated in favor of prettier.config.cjs (Prettier v3). Keeping for backward compatibility.
module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,

  // Line formatting
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',

  // Vue specific
  vueIndentScriptAndStyle: false,

  // Arrow functions
  arrowParens: 'avoid',

  // HTML whitespace
  htmlWhitespaceSensitivity: 'css',

  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',

  // Override for specific file types
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue',
        vueIndentScriptAndStyle: true,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
  ],
};
