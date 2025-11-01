const CACHE_NAME = 'lspp-cache-v1';
const FILES_TO_CACHE = [
  '/docs/reflection_form_improved.html',
  '/docs/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
