// Agent HQ service worker — deliberately conservative.
// Navigations are network-first (the office must never present a cached
// page as if it were live); only static assets are cached. Supabase and
// API traffic is never intercepted.
const CACHE = "agent-hq-v1";
const STATIC = ["/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (STATIC.includes(url.pathname) || url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then(
        (hit) => hit || fetch(event.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
          return res;
        }),
      ),
    );
  }
  // Everything else (pages, data): straight to the network, no caching.
});
