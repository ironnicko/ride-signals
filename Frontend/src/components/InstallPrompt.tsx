"use client";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    // Detect iOS devices
    const userAgent = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect standalone mode (installed PWA)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Android 'beforeinstallprompt' event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Prevent the default mini-infobar
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // Hide if already installed
  if (isStandalone) return null;
  if (!isIOS && !showPrompt) return null;

  return (
    <div
      className={`fixed ${showPrompt ? "" : "hidden"} top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-300 shadow-lg rounded-xl px-2 py-2 text-center z-50 w-[90%] max-w-md`}
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-800">
        Install This App
      </h3>

      {!isIOS && (
        <button
          onClick={handleInstallClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Add to Home Screen
        </button>
      )}

      {isIOS && (
        <p className="text-sm text-gray-700 mt-2">
          To install this app on your iPhone or iPad, tap the{" "}
          <span className="font-semibold">Share</span> button and then{" "}
          <span className="font-semibold">“Add to Home Screen”</span>{" "}
          <span role="img" aria-label="plus icon">
            ➕
          </span>
        </p>
      )}

      <button
        onClick={() => {
          setShowPrompt(false);
        }}
        className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-sm"
      >
        ✕
      </button>
    </div>
  );
}
