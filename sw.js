/* BeamCast site service worker: keeps a copy of the website and the app shell so both open offline.
   The BeamCast app page itself is stored by app.html and refreshed from Apps Script on every launch. */
const CACHE = 'beamcast-site-v2';
const SHELL = ['./', './index.html', './app.html', './styles.css', './site.js', './launch.js', './download.json', './404.html',
  './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  // One missing optional file must not stop the rest from being cached.
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Never touch Apps Script / Google traffic, non-GET requests, or the large app download.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.endsWith('.exe')) return;
  // Network first (so updates arrive at once), cache as the fallback when offline or the host is failing.
  const fromCache = () => caches.match(e.request, { ignoreSearch: true })
    .then((hit) => hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : null));
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; }
      return fromCache().then((hit) => hit || res);
    }).catch(() => fromCache().then((hit) => hit || Response.error()))
  );
});
