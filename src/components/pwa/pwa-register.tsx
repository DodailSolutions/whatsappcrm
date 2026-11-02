"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-logo";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service worker registration failed:", err);
          });
      });
    }

    // 2. Intercept beforeinstallprompt for Chrome/Android
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if user hasn't dismissed it in this session
      const dismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone;
    if (isIosDevice && !isStandalone) {
      setIsIos(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandMark size={36} />
          <div>
            <h4 className="text-xs font-bold text-foreground">Install Dodail CRM</h4>
            <p className="text-[11px] text-muted-foreground">
              {isIos
                ? "Tap the Share icon and select 'Add to Home Screen'."
                : "Install as a native desktop or mobile app for instant access."}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground p-1 rounded"
          aria-label="Dismiss banner"
        >
          <X className="size-4" />
        </button>
      </div>

      {!isIos && deferredPrompt && (
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="w-full text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white h-8"
          >
            <Download className="mr-1.5 size-3.5" /> Install App
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-xs h-8 text-muted-foreground"
          >
            Not Now
          </Button>
        </div>
      )}
    </div>
  );
}

