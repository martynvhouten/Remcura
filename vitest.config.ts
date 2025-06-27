import { defineConfig } from 'vitest/config'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: 'src/css/quasar-variables.sass'
    })
  ],
  
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['test/setup.ts']
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
      stores: resolve(__dirname, './src/stores')
    }
  }
}) 