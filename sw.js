const CACHE_PREFIX = "sgf-to-music-";
const CACHE_NAME = `${CACHE_PREFIX}v25`;
const KATAGO_RUNTIME_CACHE = "sgf2mv-katago-runtime-v1";
const APP_SHELL = [
  "./",
  "index.html",
  "about.html",
  "complex.html",
  "SGF-Postcards.html",
  "src/app.js",
  "src/game.js",
  "src/studio.js",
  "src/preferences.js",
  "src/simple-music.js",
  "src/analysis.js",
  "src/katago.js",
  "src/sha256.js",
  "src/visuals.js",
  "src/pwa.js",
  "src/styles.css",
  "manifest.webmanifest",
  "sitemap.xml",
  "robots.txt",
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
  const response = await fetch(new Request(request, { cache: "reload" }));
  if (response && response.status === 200 && response.type !== "opaque") {
    // Storage pressure must not prevent a successful network response from loading.
    await caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone())).catch(() => {});
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
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  const url = new URL(event.request.url);
  if (url.pathname.includes("/assets/katago/")) {
    // Model downloads have their own verified cache and progress reader in the client.
    if (url.pathname.endsWith(".bin.gz")) return;
    event.respondWith(caches.open(KATAGO_RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone()).catch(() => {});
      return response;
    }));
    return;
  }

  if (isAppFile(event.request)) {
    event.respondWith(cacheFresh(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return cacheFresh(event.request);
    }),
  );
});
