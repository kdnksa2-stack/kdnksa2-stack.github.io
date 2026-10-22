/* BeamCast app shell service worker: caches only the shell files on this site so the app opens offline.
   The BeamCast page itself is stored by index.html and refreshed from Apps Script on every launch. */
const CACHE = 'beamcast-shell-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Never touch Apps Script / Google traffic or non-GET requests.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Network first (so shell fixes arrive), cache as the fallback when offline or the host is failing.
  const fromCache = () => caches.match(e.request, { ignoreSearch: true })
    .then((hit) => hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : null));
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; }
      return fromCache().then((hit) => hit || res);
    }).catch(() => fromCache().then((hit) => hit || Response.error()))
  );
});
