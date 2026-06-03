const CACHE_VERSION = "jtrain-v1";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const APP_SHELL_URLS = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("jtrain-") && ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

function isSameOriginGet(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  return url.origin === self.location.origin;
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function navigationFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.put("/index.html", response.clone());
    }
    return response;
  } catch {
    return caches.match("/index.html");
  }
}

self.addEventListener("fetch", (event) => {
  if (!isSameOriginGet(event.request)) return;

  if (event.request.mode === "navigate") {
    event.respondWith(navigationFallback(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_URLS" || !Array.isArray(event.data.urls)) return;

  const urls = event.data.urls
    .filter((url) => typeof url === "string")
    .map((url) => new URL(url, self.location.href))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => url.href);

  event.waitUntil(
    caches.open(RUNTIME_CACHE)
      .then((cache) => cache.addAll(urls))
      .catch(() => undefined),
  );
});
