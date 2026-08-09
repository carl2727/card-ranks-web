/* Minimaler Service Worker für Offline-Fähigkeit (Phase 7).
   Strategie: Navigation network-first (frische HTML nach Deploys),
   sonstige gleiche-Origin-GETs cache-first (gehashte Assets sind stabil). */
const CACHE = 'card-ranks-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)

      if (req.mode === 'navigate') {
        try {
          const res = await fetch(req)
          cache.put(req, res.clone())
          return res
        } catch {
          const cached = (await cache.match(req)) || (await cache.match('./index.html'))
          if (cached) return cached
          throw new Error('offline')
        }
      }

      const cached = await cache.match(req)
      if (cached) return cached
      const res = await fetch(req)
      if (res && res.status === 200) cache.put(req, res.clone())
      return res
    })(),
  )
})
