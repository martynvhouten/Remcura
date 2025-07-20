module.exports = {
  root: true,
  ignorePatterns: [
    'src/types/supabase.ts',
    'test/**/*',
    'vitest.config.ts'
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  env: {
    node: true,
    browser: true,
    "vue/setup-compiler-macros": true,
  },
  extends: [
    // Base ESLint recommended rules
    "eslint:recommended",

    // Vue 3 essential rules
    "plugin:vue/vue3-essential",
    
    // TypeScript recommended rules
    "@vue/eslint-config-typescript",
    
    // Prettier for code formatting
    "eslint-config-prettier",
  ],
  plugins: [
    "vue",
  ],
  globals: {
    ga: "readonly", // Google Analytics
    cordova: "readonly",
    __statics: "readonly",
    __QUASAR_SSR__: "readonly",
    __QUASAR_SSR_SERVER__: "readonly",
    __QUASAR_SSR_CLIENT__: "readonly",
    __QUASAR_SSR_PWA__: "readonly",
    process: "readonly",
    Capacitor: "readonly",
    chrome: "readonly",
  },
  rules: {
    // General ESLint rules
    "prefer-promise-reject-errors": "off",
    "quotes": "off", // Let Prettier handle this
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    
    // TypeScript specific rules
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "ignoreRestSiblings": true 
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    
    // Vue specific rules
    "vue/multi-word-component-names": "off",
    "vue/no-unused-vars": "warn",
    "vue/component-definition-name-casing": ["error", "PascalCase"],
    "vue/require-default-prop": "warn",
    "vue/require-prop-types": "warn",
    "vue/no-unused-components": "warn",
    
    // Import/Export rules
    "no-duplicate-imports": "error",
    
    // Best practices
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    
    // Disable base no-unused-vars in favor of TypeScript version
    "no-unused-vars": "off",
  },
  overrides: [
    {
      files: ["*.vue"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off", // Vue SFCs handle this differently
      }
    },
    {
      files: ["test/**/*", "tests/**/*", "**/*.test.ts", "**/*.spec.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-console": "off",
      }
    }
  ]
};
