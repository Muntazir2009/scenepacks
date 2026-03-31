"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, X, SlidersHorizontal, ChevronDown, Sparkles, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORIES = ["All", "Anime", "Gaming", "Movies", "Music", "VFX", "Sports", "Nature"];
const QUALITIES = ["All", "HD", "FHD", "4K"];
const SORTS = [
  { label: "Latest", value: "latest" },
  { label: "Most Downloaded", value: "downloads" },
  { label: "Most Viewed", value: "views" },
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

function PackCard({ pack }: { pack: Scenepack }) {
  return (
    <Link
      href={`/scenepack/${pack.id}`}
      className="group"
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
            <span className="text-xl font-bold text-zinc-700">ME17</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quality */}
        {pack.quality && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-medium bg-black/60 backdrop-blur-sm rounded text-white">
            {pack.quality}
          </span>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-semibold text-white text-sm line-clamp-1">{pack.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
            <span>{pack.category}</span>
            <span>•</span>
            <span>{pack.downloads.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PackCardSkeleton() {
  return (
    <div className="aspect-video rounded-xl skeleton" />
  );
}

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [quality, setQuality] = useState(searchParams.get("quality") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [packs, setPacks] = useState<Scenepack[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 20;

  const updateUrl = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== "All") sp.set(k, v);
        else sp.delete(k);
      });
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const fetchPacks = useCallback(
    async (offset: number, append = false) => {
      try {
        if (offset === 0) setLoading(true);
        else setLoadingMore(true);

        const params = new URLSearchParams();
        if (category !== "All") params.set("category", category);
        if (quality !== "All") params.set("quality", quality);
        if (search) params.set("search", search);
        params.set("sort", sort);
        params.set("limit", LIMIT.toString());
        params.set("offset", offset.toString());

        const res = await fetch(`/api/scenepacks?${params}`);
        const data = await res.json();

        if (append) setPacks((p) => [...p, ...data.scenepacks]);
        else setPacks(data.scenepacks || []);
        setTotal(data.total || 0);
        setHasMore(data.hasMore ?? false);
      } catch {
        console.error("Failed to fetch");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, quality, search, sort]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      fetchPacks(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search, category, quality, sort, fetchPacks]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const next = page + 1;
          setPage(next);
          fetchPacks(next * LIMIT, true);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );
    if (loadRef.current) observerRef.current.observe(loadRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, page, fetchPacks]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setQuality("All");
    updateUrl({});
  };

  const hasFilters = search || category !== "All" || quality !== "All";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Browse</h1>
          <p className="text-zinc-500 mt-2">Discover scenepacks for your next edit</p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateUrl({ search: e.target.value, category, quality, sort });
                }}
                placeholder="Search scenepacks..."
                className="pl-11 pr-10 py-3 bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-600 focus:border-[#EF4444]/50 rounded-xl"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    updateUrl({ search: "", category, quality, sort });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-zinc-900/50 border-white/5 text-zinc-400 gap-2 rounded-xl">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">{SORTS.find((s) => s.value === sort)?.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-white/10 rounded-xl">
                {SORTS.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() => {
                      setSort(s.value);
                      updateUrl({ search, category, quality, sort: s.value });
                    }}
                    className={`focus:bg-white/5 rounded-lg ${sort === s.value ? "text-[#EF4444]" : "text-zinc-400"}`}
                  >
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear */}
            {hasFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="text-zinc-500 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  updateUrl({ search, category: cat, quality, sort });
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-white text-black"
                    : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quality Chips */}
          <div className="flex gap-2">
            {QUALITIES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuality(q);
                  updateUrl({ search, category, quality: q, sort });
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  quality === q
                    ? "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30"
                    : "bg-zinc-900/50 text-zinc-500 hover:text-white border border-transparent"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Grid3X3 className="w-4 h-4" />
          <span className="text-white font-medium">{total.toLocaleString()}</span> scenepacks found
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <PackCardSkeleton key={i} />
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No scenepacks found</h3>
            <p className="text-zinc-500 mb-6">Try adjusting your filters</p>
            <Button onClick={clearFilters} variant="outline" className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5">
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </motion.div>

            {/* Load more */}
            <div ref={loadRef} className="mt-8">
              {loadingMore && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <PackCardSkeleton key={i} />
                  ))}
                </div>
              )}
              {!hasMore && packs.length > 0 && (
                <p className="text-center text-zinc-600 py-8 text-sm">You've reached the end</p>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => <PackCardSkeleton key={i} />)}
          </div>
        </div>
        <Footer />
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  );
}
