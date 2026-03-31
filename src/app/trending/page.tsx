"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Flame, TrendingUp, Eye, Loader2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TIMEFRAMES = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "All Time", value: "all" },
];

interface Scenepack {
  id: string;
  title: string;
  thumbnailUrl?: string;
  category: string;
  quality?: string;
  views: number;
  downloads: number;
}

function PackCard({ pack, rank }: { pack: Scenepack; rank: number }) {
  const isTopThree = rank <= 3;

  return (
    <Link href={`/scenepack/${pack.id}`} className="group block">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
        {/* Rank Badge */}
        <div
          className={`absolute -left-1 -top-1 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
            rank === 1
              ? "bg-yellow-500 text-black"
              : rank === 2
              ? "bg-zinc-400 text-black"
              : rank === 3
              ? "bg-amber-600 text-white"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {rank}
        </div>

        {pack.thumbnailUrl ? (
          <img
            src={pack.thumbnailUrl}
            alt={pack.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl font-bold text-zinc-700">ME17</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quality */}
        {pack.quality && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[11px] font-medium bg-black/60 backdrop-blur-sm rounded text-white">
            {pack.quality}
          </span>
        )}

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

function PackCardSkeleton() {
  return <div className="aspect-video rounded-xl skeleton" />;
}

function TrendingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [timeframe, setTimeframe] = useState(searchParams.get("timeframe") || "week");
  const [packs, setPacks] = useState<Scenepack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/scenepacks?sort=trending&timeframe=${timeframe}&limit=20`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        setPacks(d.scenepacks || []);
        setLoading(false);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [timeframe]);

  const handleTimeframeChange = (v: string) => {
    setTimeframe(v);
    setLoading(true);
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("timeframe", v);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const top3 = packs.slice(0, 3);
  const rest = packs.slice(3);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-8 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#EF4444]/5 via-transparent to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#EF4444]/10 mb-4">
                <Flame className="w-7 h-7 text-[#EF4444]" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                Trending <span className="text-[#EF4444]">Now</span>
              </h1>
              <p className="text-zinc-500 max-w-md mx-auto">The hottest scenepacks right now, ranked by popularity</p>
            </motion.div>

            {/* Toggle & Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="inline-flex bg-zinc-900/50 rounded-full p-1 border border-white/5">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => handleTimeframeChange(tf.value)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      timeframe === tf.value
                        ? "bg-[#EF4444] text-white"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6 text-sm">
              <div className="flex items-center gap-2 text-zinc-500">
                <TrendingUp className="w-4 h-4 text-[#EF4444]" />
                <span className="text-white font-medium">{packs.length}</span> packs
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <Eye className="w-4 h-4 text-[#EF4444]" />
                <span className="text-white font-medium">
                  {packs.reduce((a, p) => a + p.views, 0).toLocaleString()}
                </span>{" "}
                views
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <PackCardSkeleton key={i} />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <PackCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : packs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Nothing trending yet</h3>
              <p className="text-zinc-500">Check back later for hot new scenepacks</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Top 3 */}
              <div>
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">Top 3</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {top3.map((pack, i) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <PackCard pack={pack} rank={i + 1} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Rest */}
              {rest.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                    More Trending
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {rest.map((pack, i) => (
                      <motion.div
                        key={pack.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      >
                        <PackCard pack={pack} rank={i + 4} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-8 sm:p-12 text-center overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#EF4444]/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Want your pack trending?</h2>
                <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                  Upload your best scenepacks and get featured in the trending section
                </p>
                <Link href="/upload">
                  <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#EF4444] text-white font-semibold rounded-full hover:bg-[#DC2626] transition-all hover:scale-105">
                    <Upload className="w-5 h-5" />
                    Upload Your Pack
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

export default function TrendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#EF4444] animate-spin" />
        </div>
      }
    >
      <TrendingPageContent />
    </Suspense>
  );
}
