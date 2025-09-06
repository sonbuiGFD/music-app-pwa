import { useState, useEffect, useCallback } from "react";
import { PWAInstallPrompt } from "@/types";

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(
    null
  );
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [isStandalone, setIsStandalone] = useState(false);

  // Check if app is installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running in standalone mode
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    checkInstalled();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = () => checkInstalled();

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Check online status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as any);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Handle app installed
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to install PWA:", error);
      return false;
    }
  }, [installPrompt]);

  const canInstall = isInstallable && !isInstalled;

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    canInstall,
    install,
  };
};

export const useServiceWorker = () => {
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          setSwRegistration(registration);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "CACHE_UPDATED") {
          setIsOfflineReady(true);
        }
      });

      // Check if app is offline ready
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          setIsOfflineReady(true);
        }
      });
    }
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  }, [swRegistration]);

  const skipWaiting = useCallback(() => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }, [swRegistration]);

  return {
    swRegistration,
    isUpdateAvailable,
    isOfflineReady,
    updateServiceWorker,
    skipWaiting,
  };
};

export const useStorage = () => {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    quota: 0,
  });

  const updateStorageInfo = useCallback(async () => {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageInfo({
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          quota: estimate.quota || 0,
        });
      } catch (error) {
        console.error("Failed to get storage info:", error);
      }
    }
  }, []);

  useEffect(() => {
    updateStorageInfo();
  }, [updateStorageInfo]);

  const requestPersistentStorage = useCallback(async () => {
    if ("storage" in navigator && "persist" in navigator.storage) {
      try {
        const granted = await navigator.storage.persist();
        if (granted) {
          await updateStorageInfo();
        }
        return granted;
      } catch (error) {
        console.error("Failed to request persistent storage:", error);
        return false;
      }
    }
    return false;
  }, [updateStorageInfo]);

  const clearStorage = useCallback(async () => {
    if ("storage" in navigator && "clear" in navigator.storage) {
      try {
        await (navigator.storage as any).clear();
        await updateStorageInfo();
        return true;
      } catch (error) {
        console.error("Failed to clear storage:", error);
        return false;
      }
    }
    return false;
  }, [updateStorageInfo]);

  return {
    storageInfo,
    updateStorageInfo,
    requestPersistentStorage,
    clearStorage,
  };
};
