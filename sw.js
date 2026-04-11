/* El Despacho de Overton — Service Worker v1 */
const CACHE = 'overton-v2';
const PRECACHE = [
  '/',
  '/sentencias/',
  '/directivas/',
  '/glosario/',
  '/comunidad/',
  '/medioambiente/',
  '/opinion/',
  '/otros/',
  '/about/',
  '/debate-del-dia/',
  '/pregunta/',
  '/manifest.json',
  '/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
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
  const url = new URL(e.request.url);
  // No interceptar peticiones a Supabase (siempre red)
  if (url.hostname.includes('supabase.co')) return;
  // Cache-first para assets estáticos, network-first para HTML
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/'))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
