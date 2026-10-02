// ASCD Service Worker - Versão v10 com Network-First e Auto-Update
const CACHE_NAME = 'ascd-cache-v10';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/bible-data.js',
  './js/devotional-data.js',
  './js/canvas.js',
  './js/app.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] A remover cache antiga:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network-First: Procura primeiro na rede para carregar sempre a versão mais recente publicada.
// Se não houver internet (offline), usa os ficheiros da cache local.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Ignorar pedidos a scripts externos ou APIs que não sejam do mesmo domínio
  if (!e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Mensagem para forçar atualização imediata quando solicitado
self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
