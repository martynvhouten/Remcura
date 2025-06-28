import { createApp } from 'vue'
import { Quasar } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v7/mdi-v7.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Import monitoring service
import { initializeMonitoring, monitoringService } from './services/monitoring'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const myApp = createApp(App)

// Global error handler
myApp.config.errorHandler = (error, instance, info) => {
  console.error('Global error handler:', error, info)
  
  // Send to monitoring service
  monitoringService.captureError(error as Error, {
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: sessionStorage.getItem('sessionId') || 'unknown'
  })
}

// Initialize monitoring service
initializeMonitoring(router).catch(error => {
  console.error('Failed to initialize monitoring:', error)
})

myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

myApp.use(createPinia())
myApp.use(router)

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount('#app') 