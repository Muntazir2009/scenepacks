"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Eye, TrendingUp, Package, Loader2 } from "lucide-react";
import LoadingScreen from "@/components/ui-custom/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScenepackCard from "@/components/scenepack/ScenepackCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Scenepack {
  id: string;
  title: string;
  description?: string;
  category: string;
  quality: string;
  tags: string[];
  views: number;
  downloads: number;
  thumbnailUrl?: string;
  createdAt: string;
  createdBy?: { name: string };
}

interface HomeData {
  featured: Scenepack[];
  trending: Scenepack[];
  latest: Scenepack[];
  stats: {
    scenepacks: number;
    downloads: number;
    users: number;
  };
  categories: Record<string, number>;
}

export default function Home() {
  // Check if we've already loaded in this session
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("mythiceditz17_loaded");
    }
    return true;
  });
  const [data, setData] = useState<HomeData | null>(null);

  useEffect(() => {
    if (!isLoading) {
      // Fetch home data
      fetch("/api/home")
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch(console.error);
    }
  }, [isLoading]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    sessionStorage.setItem("mythiceditz17_loaded", "true");
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-transparent" />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.3) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 50%, rgba(220, 38, 38, 0.2) 0%, transparent 50%)`,
                }}
              />
            </div>

            <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-4xl mx-auto"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <Badge
                    variant="outline"
                    className="border-red-600/50 text-red-400 px-4 py-1 text-sm"
                  >
                    🎬 Premium Scenepack Platform
                  </Badge>
                </motion.div>

                {/* Main heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                >
                  <span className="text-white">Elevate Your </span>
                  <span className="gradient-text">Edits</span>
                  <br />
                  <span className="text-white">with Premium </span>
                  <span className="text-red-500">Scenepacks</span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto"
                >
                  Browse, preview, and download high-quality scenepacks. 
                  Twixtor-ready, 4K footage, and cinematic effects for your video edits.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Link href="/browse">
                    <Button
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg group"
                    >
                      Browse Scenepacks
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/upload">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-red-600/50 text-red-400 hover:bg-red-600/10 hover:text-red-300 px-8 py-6 text-lg"
                    >
                      Upload Your Pack
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-red-500">
                    {data?.stats.scenepacks || 0}+
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Scenepacks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-red-500">
                    {data?.stats.downloads ? `${(data.stats.downloads / 1000).toFixed(0)}K+` : "0"}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-red-500">
                    {data?.stats.users ? `${(data.stats.users / 1000).toFixed(1)}K+` : "0"}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Users</div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Trending Section */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-red-950/5 to-transparent">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-8"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-red-500" />
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Trending Now
                  </h2>
                </div>
                <Link href="/browse?sort=trending">
                  <Button variant="ghost" className="text-red-400 hover:text-red-300">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {data?.trending ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.trending.map((scenepack, index) => (
                    <motion.div
                      key={scenepack.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ScenepackCard scenepack={scenepack} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                </div>
              )}
            </div>
          </section>

          {/* Latest Section */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-8"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-red-500" />
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Latest Uploads
                  </h2>
                </div>
                <Link href="/browse">
                  <Button variant="ghost" className="text-red-400 hover:text-red-300">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {data?.latest ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {data.latest.map((scenepack, index) => (
                    <motion.div
                      key={scenepack.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ScenepackCard scenepack={scenepack} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative rounded-2xl overflow-hidden"
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-950/50 via-red-900/30 to-red-950/50 border border-red-600/20" />
                
                <div className="relative z-10 p-8 md:p-16 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Upload Your Scenepacks?
                  </h2>
                  <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                    Share your premium scenepacks with thousands of editors worldwide. 
                    Get featured and grow your audience.
                  </p>
                  <Link href="/upload">
                    <Button
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white px-8"
                    >
                      Start Uploading
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
