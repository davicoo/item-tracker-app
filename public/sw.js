const CACHE_NAME = 'image-cache-v1';

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (
    url.origin.includes('.supabase.co') &&
    url.pathname.includes('/storage/v1/object/public/images')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) {
            return cached;
          }
          return fetch(event.request).then(response => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
  }
});
