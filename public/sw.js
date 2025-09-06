const CACHE_NAME = "music-app-v1";
const STATIC_CACHE = "music-app-static-v1";
const AUDIO_CACHE = "music-app-audio-v1";

// Static assets to cache
const STATIC_ASSETS = [
  "/",
  "/dispatch",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Audio file extensions to cache
const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".wav", ".ogg"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static assets...");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Static assets cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== AUDIO_CACHE) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === "GET") {
    // Static assets - cache first
    if (isStaticAsset(request.url)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
    // Audio files - cache first with fallback
    else if (isAudioFile(request.url)) {
      event.respondWith(cacheFirst(request, AUDIO_CACHE));
    }
    // API requests - network first
    else if (isApiRequest(request.url)) {
      event.respondWith(networkFirst(request));
    }
    // Other requests - network first with cache fallback
    else {
      event.respondWith(networkFirst(request, STATIC_CACHE));
    }
  }
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Cache first strategy failed:", error);
    return new Response("Offline content not available", { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, fallbackCache = null) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      if (fallbackCache) {
        const cache = await caches.open(fallbackCache);
        cache.put(request, networkResponse.clone());
      }
    }

    return networkResponse;
  } catch (error) {
    console.log("Network request failed, trying cache:", error);

    if (fallbackCache) {
      const cache = await caches.open(fallbackCache);
      const cachedResponse = await cache.match(request);

      if (cachedResponse) {
        return cachedResponse;
      }
    }

    return new Response("Offline content not available", { status: 503 });
  }
}

// Check if URL is a static asset
function isStaticAsset(url) {
  return (
    STATIC_ASSETS.some((asset) => url.includes(asset)) ||
    url.includes("/_next/static/") ||
    url.includes("/icons/") ||
    url.includes("/manifest.json")
  );
}

// Check if URL is an audio file
function isAudioFile(url) {
  return (
    AUDIO_EXTENSIONS.some((ext) => url.includes(ext)) || url.includes("/audio/")
  );
}

// Check if URL is an API request
function isApiRequest(url) {
  return (
    url.includes("/api/") ||
    url.includes("youtube.com") ||
    url.includes("yt-dlp")
  );
}

// Background sync for offline audio downloads
self.addEventListener("sync", (event) => {
  if (event.tag === "audio-download") {
    console.log("Background sync: audio download");
    event.waitUntil(handleAudioDownload());
  }
});

// Handle audio download in background
async function handleAudioDownload() {
  try {
    // This would integrate with the actual download logic
    console.log("Handling background audio download...");

    // Notify clients that cache was updated
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "CACHE_UPDATED",
        message: "Audio files updated",
      });
    });
  } catch (error) {
    console.error("Background audio download failed:", error);
  }
}

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CACHE_AUDIO":
      cacheAudioFile(data.url, data.blob);
      break;

    case "CLEAR_CACHE":
      clearCache(data.cacheName);
      break;

    default:
      console.log("Unknown message type:", type);
  }
});

// Cache audio file
async function cacheAudioFile(url, blob) {
  try {
    const cache = await caches.open(AUDIO_CACHE);
    const response = new Response(blob);
    await cache.put(url, response);
    console.log("Audio file cached:", url);
  } catch (error) {
    console.error("Failed to cache audio file:", error);
  }
}

// Clear specific cache
async function clearCache(cacheName) {
  try {
    await caches.delete(cacheName);
    console.log("Cache cleared:", cacheName);
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      tag: "music-app-notification",
      requireInteraction: true,
      actions: [
        {
          action: "play",
          title: "Play",
          icon: "/icons/icon-72x72.png",
        },
        {
          action: "pause",
          title: "Pause",
          icon: "/icons/icon-72x72.png",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "play") {
    // Handle play action
    event.waitUntil(clients.openWindow("/"));
  } else if (event.action === "pause") {
    // Handle pause action
    event.waitUntil(clients.openWindow("/"));
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"));
  }
});

console.log("Service Worker loaded");
