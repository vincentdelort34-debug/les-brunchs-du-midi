// ═══════════════════════════════════════════════════════
//  Canal Livraisons – Service Worker
//  Stratégie : Cache First pour assets, Network First pour données
// ═══════════════════════════════════════════════════════

const CACHE_NAME = "canal-livraisons-v1";
const OFFLINE_URL = "/offline.html";

// Assets à mettre en cache immédiatement à l'installation
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // Fonts Google (si hébergées localement)
  // "/fonts/CormorantGaramond.woff2",
  // "/fonts/DMSans.woff2",
];

// ── INSTALL : mise en cache des assets statiques ──────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installation...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Mise en cache des assets statiques");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE : nettoyage des anciens caches ───────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activation...");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Suppression ancien cache :", name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH : stratégie de réponse ─────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes non-GET et les appels externes (WhatsApp, fonts Google)
  if (event.request.method !== "GET") return;
  
  const url = new URL(event.request.url);
  
  // Ignorer les requêtes cross-origin (APIs externes)
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Cache First pour les assets statiques (JS, CSS, images, fonts)
      if (cachedResponse) {
        // Revalider en arrière-plan (Stale While Revalidate)
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);
        
        return cachedResponse; // Retourne le cache immédiatement
      }

      // Network First pour les requêtes non cachées
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          // Mettre en cache la réponse fraîche
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // Hors ligne : retourner la page offline pour les navigations HTML
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// ── BACKGROUND SYNC : commandes en attente hors ligne ────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    console.log("[SW] Synchronisation des commandes en attente...");
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  // Récupère les commandes stockées hors ligne (via IndexedDB si implémenté)
  console.log("[SW] Commandes synchronisées.");
}

// ── PUSH NOTIFICATIONS (optionnel) ───────────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || "Nouvelle commande reçue !",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Voir la commande" },
      { action: "close", title: "Ignorer" },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || "Canal Livraisons", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
