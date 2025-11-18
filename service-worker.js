// VERSION DEL CACHE — cámbiala cada vez que actualices
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `cm-cache-${CACHE_VERSION}`;

// Archivos que se guardan para que funcione offline
const APP_SHELL = [
  "/control-maquinaria/",
  "/control-maquinaria/index.html",
  "/control-maquinaria/style.css",
  "/control-maquinaria/script.js",
  "/control-maquinaria/manifest.json",

  // Íconos
  "/control-maquinaria/icons/icon-192.png",
  "/control-maquinaria/icons/icon-512.png",

  // Opcionalmente agrega capturas si las usas
  "/control-maquinaria/icons/screenshot1.png"
];

// INSTALACIÓN — Guarda todo en caché
self.addEventListener("install", e => {
  console.log("[SW] Instalando…");

  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting(); // Fuerza activación inmediata
});

// ACTIVACIÓN — Elimina versiones antiguas
self.addEventListener("activate", e => {
  console.log("[SW] Activado");

  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim(); // Reclama control de todas las pestañas
});

// ESTRATEGIA DE CARGA — NETWORK FIRST con fallback al cache
self.addEventListener("fetch", e => {
  const req = e.request;

  // Evitar cachear solicitudes POST o archivos de fotos
  if (req.method !== "GET") return;

  e.respondWith(
    fetch(req)
      .then(networkRes => {
        // Guardar en cache las respuestas nuevas
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, networkRes.clone());
        });
        return networkRes;
      })
      .catch(() => {
        // Si no hay internet → usa caché
        return caches.match(req).then(res => {
          // Si existe en cache → úsalo
          if (res) return res;

          // Si no existe → fallback a index.html para navegación interna
          if (req.headers.get("accept").includes("text/html")) {
            return caches.match("/control-maquinaria/index.html");
          }
        });
      })
  );
});
