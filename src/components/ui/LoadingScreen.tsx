"use client";

import { useState, useEffect, useMemo } from "react";

export function LoadingScreen() {
  // Use lazy initialization to check sessionStorage once
  const [isLoading, setIsLoading] = useState(() => {
    // Only run on client
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("loadingShown");
  });
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    // After 2.5 seconds, start fade out
    const fadeTimer = setTimeout(() => {
      setIsAnimatingOut(true);
    }, 2500);

    // After fade completes, remove loading screen
    const removeTimer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem("loadingShown", "true");
    }, 2900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className={`loading-screen ${isAnimatingOut ? "animate-out" : ""}`}>
      <div className="loading-logo">
        <span>M</span>
        <span>y</span>
        <span>t</span>
        <span>h</span>
        <span>i</span>
        <span>c</span>
        <span className="accent">E</span>
        <span className="accent">d</span>
        <span className="accent">i</span>
        <span className="accent">t</span>
        <span className="accent">z</span>
        <span className="accent">1</span>
        <span className="accent">7</span>
      </div>
      <div className="loading-bar-container">
        <div className="loading-bar" />
        <div className="loading-dot" />
      </div>
    </div>
  );
}
