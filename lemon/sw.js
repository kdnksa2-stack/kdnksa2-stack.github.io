/* Lemon plan service worker (scope /lemon/): keeps the plan, its photos and icons so it opens offline next to the tree.
   Pages and files: network first, so edits arrive at once; the cache is the fallback when offline.
   Google Fonts: cache first, since font files never change. */
const CACHE = 'lemon-plan-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest',
  './img/tree.jpg', './img/leaves.jpg', './img/brownedge.jpg', './img/newgrowth.jpg', './img/base.jpg', './img/shoot.jpg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE)
    .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('lemon-plan-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    })));
    return;
  }

  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  const fromCache = () => caches.match(e.request, { ignoreSearch: true })
    .then((hit) => hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : null));
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; }
      return fromCache().then((hit) => hit || res);
    }).catch(() => fromCache().then((hit) => hit || Response.error()))
  );
});
