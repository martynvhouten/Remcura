/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { configure } from 'quasar/wrappers';
import ESLintPlugin from 'eslint-webpack-plugin';
import { fileURLToPath, URL } from 'node:url';

export default configure(function (ctx) {
  return {
    eslint: {
      // fix: true,
      // include = [],
      // exclude = [],
      // rawOptions = {},
      warnings: false,
      errors: false
    },

    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      'i18n',
      'supabase',
      'pinia',
      'theme'
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#Property%3A-css
    css: [
      'app.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // Only include what we actually use
      'material-icons', // Keep only material icons
      'roboto-font', // Keep roboto font
      // Remove unused: mdi-v7, ionicons, etc.
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#Property%3A-build
    build: {
      target: {
        browser: [ 'es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1' ],
        node: 'node16'
      },

              vueRouterMode: 'hash', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      },
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

              extendViteConf (viteConf) {
          // Keep existing alias configuration
          Object.assign(viteConf.resolve.alias, {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
          })
          
          // Add bundle analysis
          viteConf.define = viteConf.define || {}
          
          // Advanced optimization settings
          viteConf.build = viteConf.build || {}
          viteConf.build.target = 'es2018'
          viteConf.build.cssCodeSplit = true
          viteConf.build.chunkSizeWarningLimit = 300
          viteConf.build.assetsInlineLimit = 8192 // Inline assets < 8KB
          viteConf.build.reportCompressedSize = false // Faster builds
          
          // Asset optimization
          viteConf.assetsInclude = ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp']
          
          // CSS optimization
          viteConf.css = viteConf.css || {}
          viteConf.css.devSourcemap = false
          
          // Production-only CSS purging
          if (viteConf.command === 'build') {
            viteConf.css.postcss = {
              plugins: [
                require('@fullhuman/postcss-purgecss')({
                  content: [
                    './src/**/*.vue',
                    './src/**/*.js',
                    './src/**/*.ts',
                    './src/**/*.html',
                    './index.html'
                  ],
                  safelist: [
                    // Quasar classes
                    /^q-/,
                    /^Q/,
                    // Vue transition classes
                    /-(leave|enter|appear)(|-(to|from|active))$/,
                    /^(?!(|.*?:)cursor-move).+-move$/,
                    /^router-link(|-exact)-active$/,
                    // Dark mode classes
                    /^body--dark/,
                    // Dynamic classes
                    /^text-/,
                    /^bg-/,
                    /^border-/,
                    // Material icons
                    /^material-icons/,
                    // Notification classes
                    /notification/,
                    // Animation classes
                    /animate/
                  ],
                  variables: true,
                  keyframes: true
                })
              ]
            }
          }
          
          // Manual chunking for optimal loading
          viteConf.build.rollupOptions = viteConf.build.rollupOptions || {}
          viteConf.build.rollupOptions.output = {
            // Asset naming for better caching
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name.split('.')
              const extType = info[info.length - 1]
              
              if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
                return `assets/images/[name]-[hash][extname]`
              }
              if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
                return `assets/fonts/[name]-[hash][extname]`
              }
              return `assets/[name]-[hash][extname]`
            },
            
            // Manual chunking for optimal loading
            manualChunks: (id) => {
              // Vendor libraries
              if (id.includes('node_modules')) {
                if (id.includes('vue') && !id.includes('vue-router') && !id.includes('vue-i18n')) {
                  return 'vendor-vue'
                }
                if (id.includes('quasar')) {
                  return 'vendor-quasar'
                }
                if (id.includes('vue-router') || id.includes('pinia')) {
                  return 'vendor-router'
                }
                if (id.includes('@supabase')) {
                  return 'vendor-supabase'
                }
                if (id.includes('vue-i18n')) {
                  return 'vendor-i18n'
                }
                if (id.includes('@sentry')) {
                  return 'vendor-sentry'
                }
                // Other vendor libraries
                return 'vendor-misc'
              }
              
              // Core utilities
              if (id.includes('src/composables/')) {
                return 'utils-core'
              }
              
              // Services
              if (id.includes('src/services/')) {
                return 'services'
              }
              
              // Stores
              if (id.includes('src/stores/')) {
                return 'stores'
              }
              
              // Components
              if (id.includes('src/components/') && !id.includes('src/pages/')) {
                return 'components'
              }
              
              // No manual chunking for pages - let router chunking handle them
              return null
            }
          }
          
          // Optimize dependencies
          viteConf.optimizeDeps = viteConf.optimizeDeps || {}
          viteConf.optimizeDeps.include = [
            'vue',
            'vue-router', 
            'pinia',
            'quasar',
            '@supabase/supabase-js',
            'vue-i18n'
          ]
          
          // Tree shaking improvements
          viteConf.build.rollupOptions.treeshake = {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false
          }
          
          // Production-only optimizations
          if (viteConf.command === 'build') {
            viteConf.build.minify = 'terser'
            viteConf.build.terserOptions = {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
              },
              mangle: {
                safari10: true
              }
            }
          }
        },
      // viteVuePluginOptions: {},

      vitePlugins: [
        ['@intlify/vite-plugin-vue-i18n', {
          // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
          // compositionOnly: false,

          // you need to set i18n resource including paths !
          include: './src/i18n/**'
        }]
      ]
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#Property%3A-devServer
    devServer: {
      https: false,
      port: 8080,
      open: true // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#Property%3A-framework
    framework: {
      config: {
        dark: 'auto', // or Boolean true/false or 'auto'
        brand: {
          primary: '#1e3a8a',    // Deep Medical Blue
          secondary: '#0f766e',  // Deep Teal
          accent: '#0d9488',     // Medical Teal Accent

          dark: '#1c1917',
          'dark-page': '#0a0a0a',

          positive: '#065f46',   // Deep Emerald
          negative: '#b91c1c',   // Deep Red  
          info: '#1e40af',       // Rich Blue
          warning: '#d97706'     // Professional Orange
        }
      },

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // Enable tree-shaking by only importing components we actually use
      components: [
        'QLayout',
        'QHeader', 
        'QDrawer',
        'QPage',
        'QToolbar',
        'QBtn',
        'QBtnGroup',
        'QIcon',
        'QList',
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QCard',
        'QCardSection',
        'QInput',
        'QSelect',
        'QTable',
        'QTd',
        'QTh',
        'QBadge',
        'QChip',
        'QSeparator',
        'QSpace',
        'QBanner',
        'QDialog',
        'QForm',
        'QToggle',
        'QAvatar',
        'QBtnDropdown',
        'QMenu',
        'QTooltip',
        'QLinearProgress',
        'QTabs',
        'QTab',
        'QTabPanels',
        'QTabPanel',
        'QOptionGroup'
      ],
      
      // directives: [],

      // Quasar plugins
      plugins: [
        'Notify',
        'Dialog',
        'Loading',
        'LoadingBar',
        'Dark',
        'LocalStorage',
        'SessionStorage'
      ]
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
                      // (gets superseded if process.env.PORT is specified at runtime)

      maxAge: 1000 * 60 * 60 * 24 * 30,
        // Tell browser when a file from the server should expire from cache (in ms)

      chainWebpackWebserver (chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: [ 'js' ] }])
      },

      middlewares: [
        ctx.prod ? 'compression' : '',
        'render' // keep this as last one
      ]
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW

      // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
      // if using workbox in InjectManifest mode
      chainWebpackCustomSW (chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: [ 'js' ] }])
      },

      manifest: {
        name: `MedStock Pro`,
        short_name: `MedStock Pro`,
        description: `Professional medical supply inventory management system`,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#E6E6E6',
        theme_color: '#9E0059',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'medstock-pro'
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackMain (chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: [ 'js' ] }])
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackPreload (chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: [ 'js' ] }])
      },
    }
  }
}) 