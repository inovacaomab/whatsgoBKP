// sw.js – Service Worker para WhatsGo
// Versão: atualize CACHE_NAME para forçar clients a buscar nova versão
const CACHE_NAME = 'whatsgo-static-v1';
const RUNTIME = 'whatsgo-runtime-v1';
const OFFLINE_URL = './offline_Version5.html';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './offline_Version5.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './iconeprincipal.jpg',
  './styles.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => currentCaches.includes(key) ? null : caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Navegação: network-first -> cache -> offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(RUNTIME).then(cache => { 
            cache.put(event.request, response.clone()); 
            return response; 
          });
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // APIs: stale-while-revalidate
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(RUNTIME).then(async cache => {
        const cached = await cache.match(event.request);
        const network = fetch(event.request)
          .then(resp => { 
            if (resp && resp.status === 200) cache.put(event.request, resp.clone()); 
            return resp; 
          })
          .catch(() => null);
        return cached || network;
      })
    );
    return;
  }

  // Outros recursos estáticos: cache-first, depois network
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request)
      .then(resp => {
        return caches.open(RUNTIME).then(cache => { 
          cache.put(event.request, resp.clone()); 
          return resp; 
        });
      })
      .catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('./icons/icon-192.png');
        }
      })
    )
  );
});
