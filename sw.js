const CACHE_NAME = 'media-search-v4';
const ASSETS = [
    './MediaSearchDashboard.html',
    './manifest.json',
    './icon.svg'
  ];

// Install — cache the app shell
self.addEventListener('install', event => {
    event.waitUntil(
          caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
        );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
          caches.keys().then(keys =>
                  Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
                                 )
        );
    self.clients.claim();
});

// Fetch — network-first for API calls, cache-first for app assets
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

                        // Always go to network for TMDB API and image requests
                        if (url.hostname.includes('themoviedb.org') || url.hostname.includes('tmdb.org')) {
                              event.respondWith(fetch(event.request));
                              return;
                        }

                        // Cache-first for app assets
                        event.respondWith(
                              caches.match(event.request).then(cached => {
                                      return cached || fetch(event.request).then(response => {
                                                // Cache new successful responses
                                                                                         if (response.ok) {
                                                                                                     const clone = response.clone();
                                                                                                     caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                                                                                         }
                                                return response;
                                      });
                              })
                            );
});
