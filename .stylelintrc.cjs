module.exports = {
  // Minimal enforcement: block !important only, but ignore built assets
  rules: {
    'declaration-no-important': [
      true,
      {
        ignore: ['inside-parentheses'],
      },
    ],
  },
  ignoreFiles: ['dist/**', 'public/**'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.{scss,sass}'],
      customSyntax: 'postcss-scss',
    },
  ],
};
