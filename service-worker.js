const CACHE_NAME = "control-maquinaria-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",

  // ICONOS
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/screenshot1.png"
];

// INSTALACIÓN (se ejecuta una vez)
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Cacheando archivos...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // Forzar activación inmediata
});

// ACTIVACIÓN (actualiza versiones antiguas)
self.addEventListener("activate", (event) => {
  console.log("[SW] Activado");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Borrando cache viejo:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // Tomar control inmediato
});

// FETCH (modo: offline first)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si existe en cache → devuélvelo
      if (response) return response;

      // Si no existe, intenta desde la red
      return fetch(event.request).catch(() => {
        // Si falla, devuelve index.html para rutas navegables
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
