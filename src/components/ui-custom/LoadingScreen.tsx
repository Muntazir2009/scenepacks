"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const splashTexts = [
  "Rendering Edits...",
  "Loading Cinematics...",
  "Injecting Twixtor...",
  "Preparing Scenes...",
  "Loading Effects...",
  "Buffering Frames...",
  "Optimizing Quality...",
];

export default function LoadingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [splashText, setSplashText] = useState(splashTexts[0]);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Change splash text randomly
    const textInterval = setInterval(() => {
      setSplashText(splashTexts[Math.floor(Math.random() * splashTexts.length)]);
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150);
    }, 800);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 500);
      }, 300);
    }
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background grid effect */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(220, 38, 38, 0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          {/* Radial gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)",
            }}
          />

          {/* Main logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 text-center"
          >
            {/* Logo text with glow */}
            <motion.h1
              className={`text-5xl md:text-7xl font-bold tracking-wider mb-8 ${
                isGlitching ? "animate-glitch" : ""
              }`}
              style={{
                textShadow: "0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.4)",
              }}
            >
              <span className="text-white">Mythic</span>
              <span className="text-red-600">Editz</span>
              <span className="text-red-500">17</span>
            </motion.h1>

            {/* Animated splash text */}
            <motion.p
              key={splashText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400 text-lg md:text-xl mb-12 tracking-wide"
            >
              {splashText}
            </motion.p>

            {/* Progress bar container */}
            <div className="w-64 md:w-96 mx-auto">
              {/* Progress bar background */}
              <div className="h-1 bg-gray-900 rounded-full overflow-hidden relative">
                {/* Glowing progress */}
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    background: "linear-gradient(90deg, #dc2626, #ef4444, #dc2626)",
                    boxShadow: "0 0 20px rgba(220, 38, 38, 0.8)",
                    width: `${Math.min(progress, 100)}%`,
                  }}
                  transition={{ duration: 0.1 }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 animate-shimmer" />
                </motion.div>
              </div>

              {/* Progress percentage */}
              <motion.p
                className="text-red-500 text-sm mt-4 tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {Math.min(Math.round(progress), 100)}%
              </motion.p>
            </div>
          </motion.div>

          {/* Decorative corners */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-red-600/50" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-red-600/50" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-red-600/50" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-red-600/50" />

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-600 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                opacity: 0,
              }}
              animate={{
                y: [null, -100],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
