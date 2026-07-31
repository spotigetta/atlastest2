const APP_CACHE = "atlas-app-v4.1.4";
const DATA_CACHE = "atlas-data-v4.1.4";
const APP_FILES = [
  "./","./index.html","./offline.html","./manifest.webmanifest",
  "./styles/tokens.css","./styles/base.css","./styles/components.css","./styles/themes.css","./styles/responsive.css",
  "./scripts/storage.js","./scripts/search.js","./scripts/share.js","./scripts/statistics.js","./scripts/library.js","./scripts/reader.js","./scripts/extras.js",
  "./scripts/compare.js","./scripts/reels.js","./scripts/router.js","./scripts/app.js",
  "./assets/icons/icon-192.png","./assets/icons/icon-512.png","./assets/icons/icon-maskable-512.png","./assets/icons/apple-touch-icon.png",
  "./assets/images/josemaria-silhouette.png","./assets/images/fondo_sjm.png"
  ,"./sjm_transparente.png"
  ,"./assets/infografias/infodoctrina_textogrande.html","./assets/infografias/infografiaCanonIA_v2.html","./assets/infografias/infohistoria.html",
  "./assets/infografias/infografiaLiturgIA_v2.html","./assets/infografias/infoCirculos.html","./assets/infografias/infografiaCinepilot.html",
  "./assets/infografias/infobib.html","./assets/infografias/infografiaLosClasicos_v2.html","./assets/infografias/infoSJM.html"
];

self.addEventListener("install", event => {
  event.waitUntil(Promise.all([
    caches.open(APP_CACHE).then(cache => cache.addAll(APP_FILES)),
    caches.open(DATA_CACHE).then(cache => cache.addAll(["./data/catalog.js", "./data/external-content.js", "./data/quotes.js", "./data/youtube-shorts.js", "./data/channel-catalog.js", "./data/youtube-music-cache.json", "./data/instagram-cache.json", "./data/version.json", "./data/changelog.json"]))
  ]));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => ![APP_CACHE, DATA_CACHE].includes(key)).map(key => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window" });
    await Promise.all(clients.map(client => client.navigate(client.url)));
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (url.pathname.includes("/styles/") || url.pathname.includes("/scripts/") || url.pathname.endsWith("/index.html") || url.pathname === "/") {
    event.respondWith(caches.open(APP_CACHE).then(async cache => {
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      } catch {
        return await cache.match(event.request) || await caches.match("./offline.html");
      }
    }));
    return;
  }

  if (url.pathname.includes("/data/")) {
    event.respondWith(caches.open(DATA_CACHE).then(async cache => {
      const cached = await cache.match(event.request);
      const network = fetch(event.request).then(response => {
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      }).catch(() => cached);
      const liveData = /\/data\/(catalog|external-content|version|changelog)\.(js|json)$/.test(url.pathname);
      return liveData ? (await network || cached) : (cached || network);
    }));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(APP_CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./offline.html"))));
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
