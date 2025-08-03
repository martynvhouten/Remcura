import { createApp } from 'vue';
import { Quasar } from 'quasar';

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/mdi-v7/mdi-v7.css';

// Import Quasar css
import 'quasar/src/css/index.sass';

// Import monitoring service
import { initializeMonitoring } from './services/monitoring';

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

// Initialize monitoring service
initializeMonitoring(router).catch(error => {
  // Error handling is done internally by the monitoring service
});

// Setup global error handlers for unhandled promises and JS errors
ErrorHandler.setupGlobalHandlers();

myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
});

myApp.use(createPinia());
myApp.use(router);

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount('#app');
