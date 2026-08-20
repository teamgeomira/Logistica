const CACHE_NAME = 'malanga-v1';
const urlsToCache = [
  './',
  './index.html',
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        // Si falla y no hay caché, mostrar página offline
        return caches.match('./index.html');
      });
    })
  );
});