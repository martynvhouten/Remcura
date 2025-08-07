/* eslint-env serviceworker */

const CACHE_NAME = 'remcura-v1.0.0';
const OFFLINE_CACHE_NAME = 'remcura-offline-v1.0.0';

// Files to cache for offline functionality
const CACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets as needed
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('Service Worker: Install');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching essential files');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('Service Worker: Files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activate');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE_NAME) {
              console.log('Service Worker: Removing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Old caches removed');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Try to fetch from network
      return fetch(event.request)
        .then(response => {
          // Don't cache if not a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Clone the response before caching
          const responseToCache = response.clone();

          // Cache API responses for offline use
          if (
            event.request.url.includes('/api/') ||
            event.request.url.includes('supabase.co')
          ) {
            caches.open(OFFLINE_CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }

          // Return a generic offline response for other requests
          return new Response(
            JSON.stringify({
              error: 'Offline',
              message:
                'You are currently offline. Please try again when you have an internet connection.',
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' },
            }
          );
        });
    })
  );
});

// Push event - handle push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push event received');

  let notificationData = {};

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      notificationData = {
        title: 'Remcura',
        body: event.data.text() || 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
      };
    }
  }

  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: notificationData.badge || '/icons/icon-192x192.png',
    tag: notificationData.tag || 'remcura-notification',
    data: notificationData.data || {},
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-192x192.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    vibrate: [200, 100, 200],
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Remcura',
      options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click received');

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};

  if (action === 'dismiss') {
    return;
  }

  // Handle different notification actions
  let urlToOpen = '/';

  if (notificationData.url) {
    urlToOpen = notificationData.url;
  } else if (notificationData.type) {
    switch (notificationData.type) {
      case 'stock_alert':
        urlToOpen = '/bestellijsten';
        break;
      case 'order_update':
        urlToOpen = '/orders';
        break;
      case 'system_notification':
        urlToOpen = '/dashboard';
        break;
      default:
        urlToOpen = '/';
    }
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Try to find an existing window to focus
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }

        // Open a new window if none found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event for offline data synchronization
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync event', event.tag);

  if (event.tag === 'background-sync-remcura') {
    event.waitUntil(
      syncOfflineData()
        .then(() => {
          console.log('Service Worker: Background sync completed');

          // Notify client about successful sync
          return self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_COMPLETE',
                timestamp: Date.now(),
              });
            });
          });
        })
        .catch(error => {
          console.error('Service Worker: Background sync failed', error);

          // Notify client about sync failure
          return self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_FAILED',
                error: error.message,
                timestamp: Date.now(),
              });
            });
          });
        })
    );
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;

      case 'CACHE_OFFLINE_DATA':
        event.waitUntil(
          cacheOfflineData(event.data.payload)
            .then(() => {
              event.ports[0].postMessage({ success: true });
            })
            .catch(error => {
              event.ports[0].postMessage({
                success: false,
                error: error.message,
              });
            })
        );
        break;

      case 'CLEAR_CACHE':
        event.waitUntil(
          clearCache()
            .then(() => {
              event.ports[0].postMessage({ success: true });
            })
            .catch(error => {
              event.ports[0].postMessage({
                success: false,
                error: error.message,
              });
            })
        );
        break;
    }
  }
});

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    // Get offline actions from IndexedDB or localStorage
    const offlineActions = await getOfflineActions();

    if (offlineActions.length === 0) {
      return;
    }

    // Process each offline action
    const results = await Promise.allSettled(
      offlineActions.map(action => processOfflineAction(action))
    );

    // Remove successfully processed actions
    const successfulActions = results
      .map((result, index) =>
        result.status === 'fulfilled' ? offlineActions[index] : null
      )
      .filter(Boolean);

    await removeOfflineActions(successfulActions.map(action => action.id));

    console.log(
      `Service Worker: Synced ${successfulActions.length} offline actions`
    );
  } catch (error) {
    console.error('Service Worker: Error syncing offline data', error);
    throw error;
  }
}

// Helper function to get offline actions
async function getOfflineActions() {
  // In a real implementation, you would read from IndexedDB
  // For now, return empty array
  return [];
}

// Helper function to process a single offline action
async function processOfflineAction(action) {
  // In a real implementation, you would make API calls here
  // For now, just simulate processing
  console.log('Service Worker: Processing offline action', action);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return action;
}

// Helper function to remove processed offline actions
async function removeOfflineActions(actionIds) {
  // In a real implementation, you would remove from IndexedDB
  console.log('Service Worker: Removing processed actions', actionIds);
}

// Helper function to cache offline data
async function cacheOfflineData(data) {
  const cache = await caches.open(OFFLINE_CACHE_NAME);

  // Cache the data as a JSON response
  const response = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });

  await cache.put('/offline-data', response);
  console.log('Service Worker: Offline data cached');
}

// Helper function to clear all caches
async function clearCache() {
  const cacheNames = await caches.keys();

  await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));

  console.log('Service Worker: All caches cleared');
}

// Error event handler
self.addEventListener('error', event => {
  console.error('Service Worker: Error', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker: Unhandled rejection', event.reason);
});

console.log('Service Worker: Loaded and ready');
