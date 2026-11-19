
const CACHE = "world-war-2037-v1";

const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./game_profile.jpg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  if (req.method !== "GET" ||
      new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
      }
      return response;
    }).catch(() =>
      caches.match(req).then(cached =>
        cached || (req.mode === "navigate"
          ? caches.match("./index.html")
          : Response.error())
      )
    )
  );
});
