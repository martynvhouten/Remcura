import { ref, onMounted, onUnmounted, readonly } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export function useOffline() {
  const $q = useQuasar();
  const { t } = useI18n();

  const isOnline = ref(navigator.onLine);
  const hasBeenOffline = ref(false);

  const handleOnline = () => {
    isOnline.value = true;

    if (hasBeenOffline.value) {
      $q.notify({
        type: 'positive',
        message: t('offline.messages.onlineMode'),
        icon: 'wifi',
        position: 'top',
        timeout: 3000,
      });
      hasBeenOffline.value = false;
    }
  };

  const handleOffline = () => {
    isOnline.value = false;
    hasBeenOffline.value = true;

    $q.notify({
      type: 'warning',
      message: t('offline.messages.offlineMode'),
      icon: 'wifi_off',
      position: 'top',
      timeout: 0, // Persistent until online
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          handler: () => {
            /* dismiss */
          },
        },
      ],
    });
  };

  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  });

  return {
    isOnline: readonly(isOnline),
  };
}

// Service worker registration helper
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        // Service Worker registered successfully

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New content is available
                if (
                  confirm(
                    'A new version of the app is available. Would you like to reload now?'
                  )
                ) {
                  window.location.reload();
                }
              }
            });
          }
        });
      } catch (error) {
        // Service Worker registration failed - functionality will be limited
      }
    });
  }
}
