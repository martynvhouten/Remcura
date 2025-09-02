/*
 * ESLint configuration for Remcura
 */
module.exports = {
	root: true,
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		ecmaVersion: 2022,
		sourceType: 'module',
		extraFileExtensions: ['.vue'],
	},
	env: {
		node: true,
		browser: true,
		es2022: true,
		'vue/setup-compiler-macros': true,
	},
	globals: {
		$t: 'readonly',
	},
	extends: [
		'eslint:recommended',
		'plugin:vue/vue3-recommended',
		'plugin:@typescript-eslint/recommended',
		'eslint-config-prettier',
	],
	plugins: ['vue', '@typescript-eslint'],
	rules: {
		// General
		'prefer-promise-reject-errors': 'off',
		quotes: 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

		// TypeScript
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
		],
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-non-null-assertion': 'warn',

		// Vue
		'vue/multi-word-component-names': 'off',
		'vue/no-unused-vars': 'warn',
		'vue/component-definition-name-casing': ['error', 'PascalCase'],
		'vue/require-default-prop': 'warn',
		'vue/require-prop-types': 'warn',
		'vue/no-unused-components': 'warn',

		// Best practices
		eqeqeq: ['error', 'always'],
		curly: 'off',
		'no-var': 'error',
		'prefer-const': 'warn',
		'prefer-arrow-callback': 'warn',
		'no-unused-vars': 'off',
		'no-empty': ['error', { allowEmptyCatch: true }],
		'no-undef': 'off',
		'@typescript-eslint/ban-ts-comment': 'warn',
		'@typescript-eslint/no-unsafe-declaration-merging': 'off',
	},
	overrides: [
		{
			files: ['**/*.vue'],
			parser: 'vue-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
				ecmaVersion: 2022,
				sourceType: 'module',
				extraFileExtensions: ['.vue'],
			},
			rules: { '@typescript-eslint/no-unused-vars': 'off' },
		},
		{
			files: ['**/*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
		},
	],
};


