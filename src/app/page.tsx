"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ChevronRight, ChevronLeft, Play, Upload, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Types
interface Pack {
  id: string;
  title: string;
  thumbnailUrl?: string;
  category: string;
  quality?: string;
  views: number;
  downloads: number;
  description?: string;
}

interface HomeData {
  featured: Pack[];
  trending: Pack[];
  latest: Pack[];
  stats: { scenepacks: number; downloads: number; users: number };
}

// Counter animation
function Counter({ n, suffix = "" }: { n: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView || !n) return;
    let current = 0;
    const step = Math.ceil(n / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= n) {
        setVal(n);
        clearInterval(timer);
      } else {
        setVal(current);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [inView, n]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// Card Component
function PackCard({ pack, index }: { pack: Pack; index?: number }) {
  return (
    <Link
      href={`/scenepack/${pack.id}`}
      className="group flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px]"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
        {pack.thumbnailUrl ? (
          <img
            src={pack.thumbnailUrl}
            alt={pack.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl font-bold text-zinc-700">ME17</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quality badge */}
        {pack.quality && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-medium bg-black/60 backdrop-blur-sm rounded text-white">
            {pack.quality}
          </span>
        )}

        {/* Rank badge */}
        {index !== undefined && index < 10 && (
          <span className="absolute -left-1 -top-1 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full bg-[#EF4444] text-white shadow-lg">
            {index + 1}
          </span>
        )}

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-black fill-black ml-0.5" />
          </div>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-semibold text-white text-sm line-clamp-1">{pack.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
            <span>{pack.category}</span>
            <span>•</span>
            <span>{pack.downloads.toLocaleString()} downloads</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Carousel Component
function Carousel({ title, packs, showRank = false }: { title: string; packs: Pack[]; showRank?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!containerRef.current) return;
    const amount = containerRef.current.clientWidth * 0.85;
    containerRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!packs.length) return null;

  return (
    <section className="relative group/section">
      <div className="flex items-center justify-between mb-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/browse"
            className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 z-10 w-10 h-10 rounded-full bg-zinc-900/90 border border-white/10 text-white opacity-0 group-hover/section:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-zinc-800 hover:scale-105"
        style={{ transform: "translateY(-50%)", marginTop: "20px" }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 z-10 w-10 h-10 rounded-full bg-zinc-900/90 border border-white/10 text-white opacity-0 group-hover/section:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-zinc-800 hover:scale-105"
        style={{ transform: "translateY(-50%)", marginTop: "20px" }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        {packs.map((pack, i) => (
          <PackCard key={pack.id} pack={pack} index={showRank ? i : undefined} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = data?.featured?.[0];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[90vh] min-h-[700px] flex items-end">
          {/* Background */}
          <div className="absolute inset-0">
            {featured?.thumbnailUrl ? (
              <img
                src={featured.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
          </div>

          {/* Content */}
          <div className="relative w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                  <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Featured</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]">
                  {featured?.title || "Premium Scenepacks"}
                </h1>

                <p className="mt-5 text-lg sm:text-xl text-zinc-300 max-w-2xl leading-relaxed">
                  {featured?.description || "High-quality scenepacks crafted for video editors. Download, create, and elevate your edits."}
                </p>

                <div className="flex flex-wrap gap-3 mt-8">
                  {featured && (
                    <Link href={`/scenepack/${featured.id}`}>
                      <button className="flex items-center gap-2 px-6 sm:px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all hover:scale-105">
                        <Play className="w-5 h-5 fill-black" />
                        Watch Now
                      </button>
                    </Link>
                  )}
                  <Link href="/browse">
                    <button className="flex items-center gap-2 px-6 sm:px-8 py-3.5 bg-white/10 text-white font-semibold rounded-full border border-white/10 hover:bg-white/20 transition-all hover:scale-105">
                      Browse Library
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-wrap justify-center gap-12 sm:gap-20 md:gap-32">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white">
                  <Counter n={data?.stats?.scenepacks || 0} />
                </div>
                <div className="text-sm text-zinc-500 mt-2 font-medium">Scenepacks</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white">
                  <Counter n={data?.stats?.downloads || 0} suffix="+" />
                </div>
                <div className="text-sm text-zinc-500 mt-2 font-medium">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white">
                  <Counter n={data?.stats?.users || 0} suffix="+" />
                </div>
                <div className="text-sm text-zinc-500 mt-2 font-medium">Creators</div>
              </div>
            </div>
          </div>
        </section>

        {/* Carousels */}
        <section className="py-12 sm:py-16 space-y-12 sm:space-y-16">
          {loading ? (
            <>
              {[1, 2, 3].map((s) => (
                <div key={s} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                  <div className="h-7 w-48 skeleton rounded-lg mb-5" />
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-[280px] flex-shrink-0">
                        <div className="aspect-video skeleton rounded-xl" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {data?.trending && <Carousel title="Trending Now" packs={data.trending} showRank />}
              {data?.featured && <Carousel title="Featured" packs={data.featured} />}
              {data?.latest && <Carousel title="Latest Uploads" packs={data.latest} />}
            </>
          )}
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden border border-white/5">
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#EF4444]/10 rounded-full blur-3xl" />

              <div className="relative text-center max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Share Your Creations
                </h2>
                <p className="mt-4 text-lg text-zinc-400">
                  Join thousands of creators sharing their scenepacks with the community. Upload your best work and get recognized.
                </p>
                <Link href="/upload">
                  <button className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-[#EF4444] text-white font-semibold rounded-full hover:bg-[#DC2626] transition-all hover:scale-105">
                    <Upload className="w-5 h-5" />
                    Upload Scenepack
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
