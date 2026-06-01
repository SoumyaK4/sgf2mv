const CACHE_NAME = "sgf-to-music-v6";
const APP_SHELL = [
  "./",
  "index.html",
  "about.html",
  "complex.html",
  "src/app.js",
  "src/pwa.js",
  "src/styles.css",
  "manifest.webmanifest",
  "sitemap.xml",
  "assets/site/logo.webp",
  "assets/site/favicons/favicon.ico",
  "assets/site/favicons/favicon-16x16.png",
  "assets/site/favicons/favicon-32x32.png",
  "assets/site/favicons/apple-touch-icon.png",
  "assets/site/favicons/android-chrome-192x192.png",
  "assets/site/favicons/android-chrome-512x512.png",
  "assets/board-and-stones/baduktv-board.png",
  "assets/board-and-stones/stones/baduktv_bb_0.png",
  "assets/board-and-stones/stones/baduktv_bb_1.png",
  "assets/board-and-stones/stones/baduktv_bb_2.png",
  "assets/board-and-stones/stones/baduktv_ww_0.png",
  "assets/board-and-stones/stones/baduktv_ww_1.png",
  "assets/board-and-stones/stones/baduktv_ww_2.png",
];
const APP_FILE_EXTENSIONS = [".html", ".js", ".css", ".webmanifest", ".xml"];

function isAppFile(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (request.mode === "navigate") return true;
  return APP_FILE_EXTENSIONS.some((extension) => url.pathname.endsWith(extension));
}

async function cacheFresh(request) {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(new Request(request, { cache: "reload" }));
  if (response && response.status === 200 && response.type !== "opaque") {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "reload" })))),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (isAppFile(event.request)) {
    event.respondWith(cacheFresh(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
