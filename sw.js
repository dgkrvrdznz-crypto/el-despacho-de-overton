/* El Despacho de Overton — Service Worker v4
   Siempre red primero: la copia guardada solo se usa si no hay conexión.
   Así una versión vieja guardada en el navegador nunca puede tapar la nueva. */
const CACHE = 'overton-v4';
const PRECACHE = ['/', '/manifest.json', '/logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Solo nuestra web; Supabase, CDN, fuentes, etc. van directos a la red
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && (req.mode === 'navigate' || PRECACHE.includes(url.pathname))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? '/' : req, copy)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('/') : Response.error()))
    )
  );
});
