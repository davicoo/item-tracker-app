const IMAGE_CACHE = 'image-cache-v1';
const API_CACHE = 'api-cache-v1';

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw err;
  }
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Cache Supabase storage images using a cache-first strategy
  if (
    url.origin.includes('.supabase.co') &&
    url.pathname.includes('/storage/v1/object/public/images')
  ) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE));
    return;
  }

  // Cache Supabase item data using a network-first strategy with fallback
  if (url.origin.includes('.supabase.co') && url.pathname.startsWith('/rest/v1/items')) {
    event.respondWith(networkFirst(event.request, API_CACHE));
  }
});
