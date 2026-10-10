/*
 * Service Worker der Smart Deutsch Akademie.
 * Bewusst minimal: Er speichert KEINE Seiten oder Daten (Schülerdaten sind personenbezogen),
 * sondern zeigt nur ohne Internet eine Hinweisseite statt einer Fehlermeldung des Browsers.
 */
const CACHE = 'sda-offline-v1';
const OFFLINE = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE, '/icons/icon-192.png'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
});
