const CACHE_NAME = 'medstock-pro-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets as needed
]

const API_CACHE_URLS = [
  // Cache demo data responses
  '/api/demo/',
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only log in development
        if (typeof importScripts !== 'undefined') {
          console.log('Service Worker: Caching static files')
        }
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              // Only log in development
              if (typeof importScripts !== 'undefined') {
                console.log('Service Worker: Clearing old cache', cacheName)
              }
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If online, update cache and return response
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone)
            })
        }
        return response
      })
      .catch(() => {
        // If offline, try to serve from cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response
            }
            
            // For navigation requests, return index.html from cache
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html')
            }
            
            // For other requests, return a custom offline response
            return new Response('Offline - Deze functie is niet beschikbaar zonder internetverbinding', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            })
          })
      })
  )
}) 