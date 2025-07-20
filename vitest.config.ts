import { defineConfig } from 'vitest/config';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/css/quasar-variables.sass',
    }),
  ],

  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['test/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        'public/',
        '*.config.*',
        'src/main.ts',
        'src/env.d.ts',
        'src/types/**',
        '**/*.d.ts',
        '**/index.ts', // Re-export files
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      watermarks: {
        statements: [80, 95],
        functions: [80, 95],
        branches: [80, 95],
        lines: [80, 95],
      },
    },

    // Performance testing
    benchmark: {
      include: ['test/**/*.bench.ts'],
      exclude: ['node_modules/**/*'],
    },

    // Test organization
    include: [
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules/**/*',
      'dist/**/*',
      'cypress/**/*',
      'test/e2e/**/*',
    ],

    // Test timeout and retry configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    retry: 1,

    // Parallel execution
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },

    // Visual regression setup
    deps: {
      inline: ['quasar', '@quasar/extras'],
    },

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,

    // Reporter configuration
    reporters: ['verbose', 'html', 'json'],
    outputFile: {
      html: './test-results/index.html',
      json: './test-results/results.json',
    },
  },

  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
      app: resolve(__dirname, './'),
      components: resolve(__dirname, './src/components'),
      layouts: resolve(__dirname, './src/layouts'),
      pages: resolve(__dirname, './src/pages'),
      assets: resolve(__dirname, './src/assets'),
      boot: resolve(__dirname, './src/boot'),
      stores: resolve(__dirname, './src/stores'),
      composables: resolve(__dirname, './src/composables'),
      services: resolve(__dirname, './src/services'),
      utils: resolve(__dirname, './src/utils'),
    },
  },
});
