"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PublicSettings {
  announcementBanner: string | null;
}

// Helper to get initial dismissed state (only runs on client)
function getInitialDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("announcementBannerDismissed") === "true";
}

export function AnnouncementBanner() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(getInitialDismissed);

  useEffect(() => {
    // Fetch public settings
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("announcementBannerDismissed", "true");
  };

  // Don't render if loading, no banner, or dismissed
  if (loading || !settings?.announcementBanner || dismissed) {
    return null;
  }

  return (
    <div className="announcement-banner text-white py-2.5 px-4 text-center text-sm font-medium relative">
      <span>{settings.announcementBanner}</span>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
