// เก็บเฉพาะตัวแอปไว้ในเครื่อง (ไม่เก็บข้อมูล) เพื่อให้เปิดจากหน้าโฮมได้ทันที
const C = 'col-shell-v1';
const SHELL = ['./', './manifest.json', './icon-192.png', './icon-180.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request; const u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  if (/version\.json|config\.js|sw\.js/.test(u.pathname)) return;
  const isPage = req.mode === 'navigate';
  if (!isPage && !/\.(png|json)$/.test(u.pathname)) return;
  const key = isPage ? './' : req;
  if (isPage && u.searchParams.has('v')) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(key, cp)); } return r; }).catch(() => caches.match(key)));
    return;
  }
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
