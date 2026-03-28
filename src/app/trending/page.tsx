"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, Loader2, Eye } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScenepackCard, { ScenepackCardSkeleton, type Scenepack } from "@/components/scenepack/ScenepackCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Timeframe configuration
const TIMEFRAMES = [
  { name: "Today", value: "today" },
  { name: "This Week", value: "week" },
  { name: "All Time", value: "all" },
] as const;

type TimeframeValue = typeof TIMEFRAMES[number]["value"];

// Extended Scenepack type with trending score
interface TrendingScenepack extends Scenepack {
  trendingScore?: number;
  createdAt?: string;
}

// Rank badge colors for top 3
const RANK_STYLES = {
  1: {
    badge: "bg-gradient-to-br from-yellow-400 to-amber-500 text-black",
    glow: "shadow-[0_0_40px_rgba(234,179,8,0.4)]",
    ring: "ring-2 ring-yellow-400/40",
    number: "text-yellow-400/15",
  },
  2: {
    badge: "bg-gradient-to-br from-gray-300 to-slate-400 text-black",
    glow: "shadow-[0_0_30px_rgba(156,163,175,0.3)]",
    ring: "ring-2 ring-gray-400/40",
    number: "text-gray-400/15",
  },
  3: {
    badge: "bg-gradient-to-br from-amber-600 to-orange-700 text-white",
    glow: "shadow-[0_0_30px_rgba(217,119,6,0.3)]",
    ring: "ring-2 ring-amber-600/40",
    number: "text-amber-600/15",
  },
} as const;

// Animation variants
const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Huge rank number component for top 3 (positioned behind card)
function HugeRankNumber({ rank, className }: { rank: number; className?: string }) {
  return (
    <div
      className={cn(
        "absolute font-black leading-none select-none pointer-events-none z-0",
        RANK_STYLES[rank as 1|2|3].number,
        className
      )}
      style={{ fontFamily: "var(--font-cinzel), serif" }}
    >
      #{rank}
    </div>
  );
}

// Top 3 Card with special styling - #1 is larger and centered
function Top3Card({
  scenepack,
  rank,
  isCenter = false,
}: {
  scenepack: TrendingScenepack;
  rank: 1 | 2 | 3;
  isCenter?: boolean;
}) {
  const styles = RANK_STYLES[rank];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: (rank - 1) * 0.1,
        ease: "easeOut",
      }}
      className={cn("relative", isCenter && "lg:scale-110 lg:z-20")}
    >
      {/* Huge rank number behind - different sizes */}
      <HugeRankNumber
        rank={rank}
        className={cn(
          "-left-2 -top-6",
          rank === 1 ? "text-[12rem] md:text-[16rem]" : "text-[10rem] md:text-[14rem]"
        )}
      />

      {/* Glow effect */}
      <div className={cn("relative rounded-xl", styles.glow)}>
        {/* Card container with ring border */}
        <div className={cn("relative rounded-xl overflow-hidden bg-[#0A0A0A]", styles.ring)}>
          {/* Rank badge in corner */}
          <div
            className={cn(
              "absolute top-3 left-3 z-20 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm",
              styles.badge
            )}
          >
            #{rank}
          </div>

          <Link href={`/scenepack/${scenepack.id}`}>
            <ScenepackCard scenepack={scenepack} priority={rank <= 2} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Standard ranked card for #4 and beyond
function RankedCard({ scenepack, rank }: { scenepack: TrendingScenepack; rank: number }) {
  return (
    <motion.div
      variants={fadeUpVariants}
      className="relative group"
    >
      {/* Rank number in corner */}
      <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md bg-[#18181b] ring-1 ring-white/10 text-[#A1A1AA] font-bold text-sm group-hover:bg-[#E11D48]/10 group-hover:text-[#E11D48] group-hover:ring-[#E11D48]/30 transition-all">
        #{rank}
      </div>

      <Link href={`/scenepack/${scenepack.id}`}>
        <ScenepackCard scenepack={scenepack} />
      </Link>
    </motion.div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Geometric empty state illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 relative">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10" />
          <div className="absolute inset-4 rounded-full border border-white/5" />
          <div className="absolute inset-8 rounded-full bg-[#0A0A0A] ring-1 ring-white/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-[#E11D48]/30" />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-medium text-white mb-2">Nothing trending</h3>
      <p className="text-[#A1A1AA] mb-8 max-w-md">
        No scenepacks found for this timeframe. Check back later or upload your own!
      </p>

      <Link href="/upload">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="px-6 py-3 rounded-lg bg-[#E11D48] hover:bg-[#E11D48]/90 text-white font-medium transition-colors"
        >
          Upload a Scenepack
        </motion.button>
      </Link>
    </motion.div>
  );
}

// Main Trending Content Component
function TrendingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get timeframe from URL, default to "week"
  const initialTimeframe = (searchParams.get("timeframe") as TimeframeValue) || "week";
  const [timeframe, setTimeframe] = useState<TimeframeValue>(initialTimeframe);
  const [scenepacks, setScenepacks] = useState<TrendingScenepack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update URL when timeframe changes
  const handleTimeframeChange = (value: TimeframeValue) => {
    setTimeframe(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeframe", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Fetch trending scenepacks
  const fetchTrending = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/scenepacks?sort=trending&timeframe=${timeframe}&limit=20`
      );
      const data = await response.json();
      setScenepacks(data.scenepacks || []);
    } catch (error) {
      console.error("Error fetching trending scenepacks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  // Split scenepacks into top 3 and remaining
  const top3 = scenepacks.slice(0, 3);
  const remaining = scenepacks.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar user={null} />

      <main className="flex-1">
        {/* Hero Header */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#E11D48]/10 via-transparent to-transparent" />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
              style={{
                background: "radial-gradient(ellipse at center top, rgba(225,29,72,0.15), transparent 60%)",
              }}
            />
          </div>

          <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              {/* Flame Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center mb-6"
              >
                <motion.div
                  animate={{
                    filter: [
                      "drop-shadow(0 0 10px rgba(225,29,72,0.5))",
                      "drop-shadow(0 0 20px rgba(225,29,72,0.8))",
                      "drop-shadow(0 0 10px rgba(225,29,72,0.5))",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="w-14 h-14 text-[#E11D48]" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4"
              >
                Trending
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-[#A1A1AA] text-lg mb-8"
              >
                The hottest scenepacks ranked by views and downloads
              </motion.p>

              {/* Timeframe Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center"
              >
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0A0A0A] ring-1 ring-white/10">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.value}
                      onClick={() => handleTimeframeChange(tf.value)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        timeframe === tf.value
                          ? "bg-[#E11D48] text-white"
                          : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                      )}
                    >
                      {tf.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex items-center justify-center gap-8 text-sm"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#E11D48]" />
                <span className="text-[#A1A1AA]">
                  Showing <span className="text-white font-semibold">{scenepacks.length}</span> trending packs
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#E11D48]" />
                <span className="text-[#A1A1AA]">
                  Total{" "}
                  <span className="text-white font-semibold">
                    {scenepacks.reduce((acc, s) => acc + (s.views || 0), 0).toLocaleString()}
                  </span>{" "}
                  views
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  {/* Top 3 Skeleton */}
                  <div className="flex flex-col lg:flex-row items-end justify-center gap-6 lg:gap-8">
                    {/* #2 on left (desktop) */}
                    <div className="hidden lg:block w-full max-w-sm">
                      <ScenepackCardSkeleton />
                    </div>
                    {/* #1 in center (larger) */}
                    <div className="w-full max-w-md lg:scale-110">
                      <ScenepackCardSkeleton />
                    </div>
                    {/* #3 on right (desktop) */}
                    <div className="hidden lg:block w-full max-w-sm">
                      <ScenepackCardSkeleton />
                    </div>
                  </div>
                  {/* Grid Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ScenepackCardSkeleton key={i} />
                    ))}
                  </div>
                </motion.div>
              ) : scenepacks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EmptyState />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  {/* Top 3 Showcase - Layout: center is #1 (larger), #2 and #3 on sides */}
                  {top3.length > 0 && (
                    <div>
                      {/* Desktop: #2 | #1 (center, larger) | #3 */}
                      <div className="hidden lg:flex items-end justify-center gap-8">
                        {/* #2 on the left */}
                        {top3[1] && (
                          <div className="w-full max-w-sm">
                            <Top3Card scenepack={top3[1]} rank={2} />
                          </div>
                        )}

                        {/* #1 in the center (larger) */}
                        {top3[0] && (
                          <div className="w-full max-w-md lg:scale-110 lg:z-20 lg:-mx-4">
                            <Top3Card scenepack={top3[0]} rank={1} isCenter />
                          </div>
                        )}

                        {/* #3 on the right */}
                        {top3[2] && (
                          <div className="w-full max-w-sm">
                            <Top3Card scenepack={top3[2]} rank={3} />
                          </div>
                        )}
                      </div>

                      {/* Mobile/Tablet: Stack #1, #2, #3 */}
                      <div className="lg:hidden space-y-6">
                        {top3[0] && <Top3Card scenepack={top3[0]} rank={1} />}
                        {top3[1] && <Top3Card scenepack={top3[1]} rank={2} />}
                        {top3[2] && <Top3Card scenepack={top3[2]} rank={3} />}
                      </div>
                    </div>
                  )}

                  {/* Remaining Packs Grid - Standard 3 columns on desktop */}
                  {remaining.length > 0 && (
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-100px" }}
                    >
                      <div className="flex items-center gap-2 mb-8">
                        <h2 className="font-display text-xl font-bold text-white">
                          More Trending
                        </h2>
                        <span className="text-[#A1A1AA] text-sm">
                          ({remaining.length} more)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {remaining.map((scenepack, index) => (
                          <RankedCard
                            key={scenepack.id}
                            scenepack={scenepack}
                            rank={index + 4}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-[#0A0A0A] border-y border-white/[0.06]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="text-center md:text-left">
                <h2 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
                  Want your pack trending?
                </h2>
                <p className="text-[#A1A1AA]">
                  Upload your best scenepacks and get featured.
                </p>
              </div>
              <Link href="/upload">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-lg bg-[#E11D48] hover:bg-[#E11D48]/90 text-white font-medium transition-colors"
                >
                  Upload Your Pack
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Export with Suspense boundary for useSearchParams
export default function TrendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-black">
          <Navbar user={null} />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#E11D48]" />
          </main>
          <Footer />
        </div>
      }
    >
      <TrendingContent />
    </Suspense>
  );
}
