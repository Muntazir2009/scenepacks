"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const splashTexts = [
  "Loading scenepacks...",
  "Preparing your edits...",
  "Almost ready...",
];

export default function LoadingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const splashText = useRef(splashTexts[Math.floor(Math.random() * splashTexts.length)]);
  const hasCompleted = useRef(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 20 + 10;
      });
    }, 150);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100 && !hasCompleted.current) {
      hasCompleted.current = true;
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 400);
      }, 200);
    }
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="text-white">MythicEditz</span>
              <span className="text-[#EF4444]">17</span>
            </h1>

            <p className="text-zinc-500 text-sm md:text-base mb-10">
              {splashText.current}
            </p>

            {/* Progress bar */}
            <div className="w-48 md:w-64 mx-auto">
              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#EF4444] rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-zinc-600 text-xs mt-3 tracking-wider">
                {Math.min(Math.round(progress), 100)}%
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
