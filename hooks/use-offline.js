"use client";

import { useState, useEffect } from "react";

/**
 * Hook to track online/offline status
 * @returns {Object} Object with isOffline (boolean) and isOnline (boolean) properties
 */
export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(() => {
    // Initialize with current status, but only if window is available (client-side)
    if (typeof window !== "undefined") {
      return !navigator.onLine;
    }
    return false; // Default to online on server-side
  });

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Set initial status
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOffline,
    isOnline: !isOffline,
  };
};
