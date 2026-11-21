// Netz zuerst (damit Änderungen auf GitHub sofort ankommen), bei fehlender Verbindung aus dem Cache
const CACHE = 'ckw-projekte-v28'; // v28: Installierbarkeit (Manifest mit id, Knopf «App installieren»)
// die LASOLTEC-Vorlage steckt seit v4 in der index.html; fehlt eine Datei auf dem Server, darf die Installation nicht scheitern
const APP = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
// fremde Quellen, die offline gebraucht werden (Bibliotheken, Schrift). Firebase-Anmeldung und Datenbank laufen nie über den Cache.
const CDN = /^(cdnjs\.cloudflare\.com|www\.gstatic\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(APP.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !CDN.test(url.host)) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
