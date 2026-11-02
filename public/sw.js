// ============================================================
// Dodail WhatsApp CRM — Progressive Web App Service Worker (v1)
// Caches only safe static assets and provides an offline fallback.
// NEVER caches private customer data, messages, or API routes.
// ============================================================

const CACHE_NAME = "dodail-crm-v2";
const OFFLINE_URL = "/offline";

const STATIC_PRECACHE = [
  "/",
  "/offline",
  "/logo.png",
  "/favicon.ico",
  "/favicon.svg",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
];

// Install: Cache safe static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn("[SW] Pre-cache partial fail:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Cleanup older caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for navigation, cache-first for static icons/assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. SECURITY: STRICTLY bypass caching for API routes, auth calls, or Supabase
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.hostname.includes("supabase.co") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // 2. Navigation requests: Network-first with offline fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL).then((res) => {
          return res || new Response("Offline — Please check internet connection.");
        });
      })
    );
    return;
  }

  // 3. Static assets: Stale-while-revalidate for local images, styles, scripts
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networked = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networked;
      })
    );
  }
});

