"use client";

import { useEffect } from "react";

// Registers the service worker in production so the PWA is installable.
export default function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability is a nice-to-have; never break the app over it.
      });
    }
  }, []);
  return null;
}
