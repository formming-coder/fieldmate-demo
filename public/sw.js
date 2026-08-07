const APP_CACHE = 'fieldmate-ai-app-v4'
const TILE_CACHE = 'fieldmate-ai-tiles-v4'
const DATA_CACHE = 'fieldmate-ai-data-v4'
const IMAGE_CACHE = 'fieldmate-ai-images-v4'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/icon.svg']

const TILE_PATTERNS = [
  'tile.openstreetmap.org',
  'server.arcgisonline.com',
  'tiles.stadiamaps.com',
]

function matchPattern(url, patterns) {
  return patterns.some((pattern) => url.includes(pattern))
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys
      .filter((key) => ![APP_CACHE, TILE_CACHE, DATA_CACHE, IMAGE_CACHE].includes(key))
      .map((key) => caches.delete(key))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const requestUrl = event.request.url

  if (matchPattern(requestUrl, TILE_PATTERNS)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          const copy = response.clone()
          caches.open(TILE_CACHE).then((cache) => cache.put(event.request, copy))
          return response
        })
        return cached || fetchPromise
      })
    )
    return
  }

  if (requestUrl.includes('/api/') || requestUrl.includes('/properties') || requestUrl.includes('/notifications') || requestUrl.includes('/tasks')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          caches.open(DATA_CACHE).then((cache) => cache.put(event.request, copy))
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
        const copy = response.clone()
        caches.open(IMAGE_CACHE).then((cache) => cache.put(event.request, copy))
        return response
      }))
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone()
      caches.open(APP_CACHE).then((cache) => cache.put(event.request, copy))
      return response
    }).catch(() => caches.match('/')))
  )
})
