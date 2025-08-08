module.exports = {
  // Minimal enforcement: block !important only
  rules: {
    'declaration-no-important': true,
  },
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
