import { createApp } from 'vue';
import { Quasar } from 'quasar';

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/mdi-v7/mdi-v7.css';

// Import Quasar css
import 'quasar/src/css/index.sass';

// Monitoring service will be lazy loaded

// Import centralized error handling
import { ErrorHandler } from '@/utils/service-error-handler';

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const myApp = createApp(App);

// Enhanced global error handler using centralized error handling
myApp.config.errorHandler = (error, instance, info) => {
  ErrorHandler.handleError(error, {
    service: 'vue',
    operation: 'vue_error_handler',
    metadata: {
      info,
      componentName: instance?.$options.name || 'unknown',
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }
  }, {
    showToUser: false, // Don't show Vue errors to users by default
    logLevel: 'error'
  });
};

// Lazy initialize monitoring service only when needed
const initMonitoringLazy = async () => {
  // Only load monitoring in production or when errors occur
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    const { initializeMonitoring } = await import('./services/monitoring');
    await initializeMonitoring(router);
  }
};

// Initialize monitoring in background after app loads
setTimeout(() => {
  initMonitoringLazy().catch(console.warn);
}, 2000); // Delay 2 seconds to not block initial load

// Setup global error handlers for unhandled promises and JS errors
ErrorHandler.setupGlobalHandlers();

myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
});

myApp.use(createPinia());
myApp.use(router);

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount('#app');
