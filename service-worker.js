const CACHE_NAME = 'malanga-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './js/config.js',
  './js/firebase.js',
  './js/auth.js',
  './js/database.js',
  './js/utils.js',
  './js/app.js',
  'https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.1/firebase-database-compat.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).catch(function() {
        return caches.match('./index.html');
      });
    })
  );
});