"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate, useInView } from "framer-motion";
import { ArrowRight, Film, TrendingUp, Package, Users, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScenepackCard from "@/components/scenepack/ScenepackCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Scenepack {
  id: string;
  title: string;
  description?: string;
  category: string;
  quality?: string;
  tags?: string[];
  views: number;
  downloads: number;
  thumbnailUrl?: string;
  previewUrl?: string;
  featured?: boolean;
  createdAt?: string;
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
    pending?: number;
  };
  categories: Record<string, number>;
}

// Animation variants - fade up with 40px offset, 0.4s duration, easeOut
const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Animated Counter with useMotionValue + useSpring
function AnimatedCounter({ 
  target, 
  suffix = "" 
}: { 
  target: number; 
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 30, stiffness: 50 });
  const rounded = useTransform(spring, (latest) => Math.round(latest).toLocaleString());
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (isInView && target > 0) {
      animate(motionValue, target, { duration: 2 });
    }
  }, [isInView, target, motionValue]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}

// Skeleton Loader Component
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] overflow-hidden">
      <div className="aspect-video skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 rounded skeleton-shimmer" />
        <div className="h-4 w-1/2 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

// Hero Section with Video Background
function HeroSection({ data }: { data: HomeData | null }) {
  const featuredWithVideo = data?.featured.find(sp => sp.previewUrl);
  
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Video Background */}
      {featuredWithVideo?.previewUrl && (
        <div className="absolute inset-0 z-0">
          <video
            src={featuredWithVideo.previewUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </div>
      )}
      
      {/* Fallback gradient background */}
      {!featuredWithVideo && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-[#0A0A0A] to-black" />
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Main Heading - massive text-7xl md:text-8xl */}
          <motion.h1 
            variants={fadeUpVariants}
            className="font-display text-7xl md:text-8xl font-bold tracking-tight leading-none mb-8"
          >
            <span className="text-white block">Premium</span>
            <span className="text-[#E11D48] block mt-2">Scenepacks</span>
          </motion.h1>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeUpVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          >
            <Link href="/browse">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-8 py-6 text-lg font-medium group"
                >
                  Browse Packs
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/upload">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="ghost"
                  className="border border-[rgba(255,255,255,0.1)] text-[#A1A1AA] hover:text-white hover:bg-white/5 px-8 py-6 text-lg"
                >
                  Upload
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-20"
        >
          <motion.div variants={fadeUpVariants} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">
              <AnimatedCounter target={data?.stats?.scenepacks || 0} />
            </div>
            <div className="text-[#A1A1AA] text-sm mt-1 uppercase tracking-wider">Scenepacks</div>
          </motion.div>
          <motion.div variants={fadeUpVariants} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">
              <AnimatedCounter target={data?.stats?.downloads || 0} suffix="+" />
            </div>
            <div className="text-[#A1A1AA] text-sm mt-1 uppercase tracking-wider">Downloads</div>
          </motion.div>
          <motion.div variants={fadeUpVariants} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">
              <AnimatedCounter target={data?.stats?.users || 0} suffix="+" />
            </div>
            <div className="text-[#A1A1AA] text-sm mt-1 uppercase tracking-wider">Users</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Featured Carousel with Embla and Autoplay
function FeaturedCarousel({ scenepacks }: { scenepacks: Scenepack[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    const timeoutId = setTimeout(() => {
      setScrollSnaps(emblaApi.scrollSnapList());
    }, 0);

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      clearTimeout(timeoutId);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  if (!scenepacks.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {scenepacks.map((scenepack) => (
            <div
              key={scenepack.id}
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-3"
            >
              <ScenepackCard scenepack={scenepack} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-8 bg-[#E11D48]"
                : "w-2 bg-[#27272a] hover:bg-[#3f3f46]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Rank Badge Component
function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) return null;
  
  const styles = {
    1: "rank-gold",
    2: "rank-silver",
    3: "rank-bronze"
  };

  return (
    <div className={`absolute -top-3 -left-3 z-20 w-10 h-10 rounded-full ${styles[rank as 1|2|3]} flex items-center justify-center font-bold text-lg shadow-lg`}>
      #{rank}
    </div>
  );
}

// Trending Section with Rank Badges
function TrendingSection({ scenepacks }: { scenepacks: Scenepack[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUpVariants} className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-[#E11D48]" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
                Trending This Week
              </h2>
            </div>
            <Link href="/browse?sort=trending">
              <Button variant="ghost" className="text-[#A1A1AA] hover:text-white hover:bg-white/5">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* 3 column grid with rank badges on top 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenepacks.slice(0, 6).map((scenepack, index) => (
              <motion.div
                key={scenepack.id}
                variants={fadeUpVariants}
                className="relative pt-3 pl-3"
              >
                <RankBadge rank={index + 1} />
                <ScenepackCard scenepack={scenepack} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Latest Uploads Section - 4 column grid
function LatestSection({ scenepacks }: { scenepacks: Scenepack[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUpVariants} className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-[#E11D48]" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
                Latest Uploads
              </h2>
            </div>
            <Link href="/browse">
              <Button variant="ghost" className="text-[#A1A1AA] hover:text-white hover:bg-white/5">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {scenepacks.slice(0, 8).map((scenepack) => (
              <motion.div
                key={scenepack.id}
                variants={fadeUpVariants}
              >
                <ScenepackCard scenepack={scenepack} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Category Pill Component
function CategoryPill({ category, count }: { category: string; count: number }) {
  return (
    <Link href={`/browse?category=${category.toLowerCase()}`}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="group px-6 py-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] hover:border-[#E11D48]/30 hover:bg-[#E11D48]/5 transition-all cursor-pointer"
      >
        <div className="font-medium text-white group-hover:text-[#E11D48] transition-colors">
          {category}
        </div>
        <div className="text-sm text-[#A1A1AA] mt-1">
          {count} {count === 1 ? "pack" : "packs"}
        </div>
      </motion.div>
    </Link>
  );
}

// Browse by Category Section
function CategorySection({ categories }: { categories: Record<string, number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const categoryEntries = Object.entries(categories);

  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUpVariants} className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
              Browse by Category
            </h2>
            <p className="text-[#A1A1AA]">Find scenepacks for your specific editing style</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-4"
          >
            {categoryEntries.map(([category, count]) => (
              <motion.div key={category} variants={fadeUpVariants}>
                <CategoryPill category={category} count={count} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Join Community Banner - minimal with real user count
function CommunityBanner({ userCount }: { userCount: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-[#0A0A0A] border-y border-[rgba(255,255,255,0.06)]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E11D48]/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#E11D48]" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight">
                Join the community
              </h2>
              <p className="text-[#A1A1AA]">
                <AnimatedCounter target={userCount} />+ creators already sharing
              </p>
            </div>
          </div>
          <Link href="/upload">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-8 group">
                Start Uploading
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Loading State with skeleton shimmer
function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar user={null} />
      <main className="flex-1">
        <section className="min-h-[90vh] flex items-center">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="h-24 w-3/4 mx-auto skeleton-shimmer rounded-xl mb-8" />
              <div className="flex gap-4 justify-center">
                <div className="h-14 w-40 skeleton-shimmer rounded-lg" />
                <div className="h-14 w-32 skeleton-shimmer rounded-lg" />
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="h-8 w-48 skeleton-shimmer rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch home data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar user={null} />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection data={data} />

        {/* Featured Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-12"
            >
              <div className="flex items-center gap-3">
                <Film className="h-6 w-6 text-[#E11D48]" />
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Featured
                </h2>
              </div>
            </motion.div>

            {data?.featured && data.featured.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              >
                <FeaturedCarousel scenepacks={data.featured} />
              </motion.div>
            ) : (
              <div className="text-center py-12 text-[#A1A1AA]">
                No featured scenepacks yet.
              </div>
            )}
          </div>
        </section>

        {/* Trending Section */}
        {data?.trending && data.trending.length > 0 && (
          <TrendingSection scenepacks={data.trending} />
        )}

        {/* Latest Uploads Section */}
        {data?.latest && data.latest.length > 0 && (
          <LatestSection scenepacks={data.latest} />
        )}

        {/* Browse by Category Section */}
        {data?.categories && Object.keys(data.categories).length > 0 && (
          <CategorySection categories={data.categories} />
        )}

        {/* Community Banner */}
        <CommunityBanner userCount={data?.stats?.users || 0} />
      </main>

      <Footer />
    </div>
  );
}
