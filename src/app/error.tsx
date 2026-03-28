"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-black px-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-20 h-20 rounded-full bg-[#E11D48]/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-[#E11D48]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-2">
            An unexpected error occurred while loading this page.
          </p>
          {error.digest && (
            <p className="text-xs text-zinc-600 dark:text-zinc-500 font-mono mb-6">
              Error ID: {error.digest}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            onClick={reset}
            className="bg-[#E11D48] hover:bg-[#BE123C] text-white gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="border-black/20 dark:border-white/20 text-foreground dark:text-white hover:bg-black/5 dark:hover:bg-white/5 gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
