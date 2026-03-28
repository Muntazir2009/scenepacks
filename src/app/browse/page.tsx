"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Grid3X3,
  List,
  ChevronDown,
  X,
  Download,
  Eye,
  Heart,
  Sparkles,
  LayoutGrid,
  AlignJustify,
  SlidersHorizontal,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScenepackCard, { ScenepackCardSkeleton, Scenepack } from "@/components/scenepack/ScenepackCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Categories list
const CATEGORIES = [
  { name: "All", value: "all" },
  { name: "Anime", value: "anime" },
  { name: "Gaming", value: "gaming" },
  { name: "Movies", value: "movies" },
  { name: "Music", value: "music" },
  { name: "VFX", value: "vfx" },
  { name: "Sports", value: "sports" },
  { name: "Nature", value: "nature" },
  { name: "Abstract", value: "abstract" },
];

// Quality options
const QUALITY_OPTIONS = [
  { name: "All Qualities", value: "all" },
  { name: "HD", value: "HD" },
  { name: "FHD", value: "FHD" },
  { name: "4K", value: "4K" },
];

// Sort options
const SORT_OPTIONS = [
  { name: "Latest", value: "latest" },
  { name: "Most Downloaded", value: "downloads" },
  { name: "Most Viewed", value: "views" },
  { name: "Most Liked", value: "likes" },
];

type ViewMode = "grid" | "list";

// Extended Scenepack type for list view
interface ExtendedScenepack extends Scenepack {
  description?: string;
  tags?: string[];
  createdAt?: string;
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State management - initialized from URL params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [quality, setQuality] = useState(searchParams.get("quality") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [scenepacks, setScenepacks] = useState<ExtendedScenepack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  const LIMIT = 12;

  // Load view preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("browse-view-mode") as ViewMode;
    if (savedViewMode && (savedViewMode === "grid" || savedViewMode === "list")) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Update URL params when filters change
  const updateUrlParams = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Handle search change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      updateUrlParams({ search: value, category, quality, sort });
    },
    [category, quality, sort, updateUrlParams]
  );

  // Handle category change
  const handleCategoryChange = useCallback(
    (value: string) => {
      setCategory(value);
      setPage(0);
      updateUrlParams({ search, category: value, quality, sort });
    },
    [search, quality, sort, updateUrlParams]
  );

  // Handle quality change
  const handleQualityChange = useCallback(
    (value: string) => {
      setQuality(value);
      setPage(0);
      updateUrlParams({ search, category, quality: value, sort });
    },
    [search, category, sort, updateUrlParams]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (value: string) => {
      setSort(value);
      setPage(0);
      updateUrlParams({ search, category, quality, sort: value });
    },
    [search, category, quality, updateUrlParams]
  );

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("browse-view-mode", mode);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch scenepacks
  const fetchScenepacks = useCallback(
    async (offset: number, append = false) => {
      try {
        if (offset === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params = new URLSearchParams();
        if (category !== "all") params.append("category", category);
        if (quality !== "all") params.append("quality", quality);
        if (debouncedSearch) params.append("search", debouncedSearch);
        params.append("sort", sort === "likes" ? "trending" : sort);
        params.append("limit", LIMIT.toString());
        params.append("offset", offset.toString());

        const response = await fetch(`/api/scenepacks?${params}`);
        const data = await response.json();

        if (append) {
          setScenepacks((prev) => [...prev, ...data.scenepacks]);
        } else {
          setScenepacks(data.scenepacks);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error("Error fetching scenepacks:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [category, quality, debouncedSearch, sort]
  );

  // Initial fetch and when filters change
  useEffect(() => {
    setPage(0);
    fetchScenepacks(0, false);
  }, [category, quality, sort, debouncedSearch, fetchScenepacks]);

  // Infinite scroll observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchScenepacks(nextPage * LIMIT, true);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, page, fetchScenepacks]);

  // Sticky filter bar detection
  useEffect(() => {
    const handleScroll = () => {
      if (filterBarRef.current) {
        const rect = filterBarRef.current.getBoundingClientRect();
        setIsFilterSticky(rect.top <= 64);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get active filters for display
  const activeFilters = [];
  if (category !== "all") {
    activeFilters.push({ key: "category", label: CATEGORIES.find((c) => c.value === category)?.name || category });
  }
  if (quality !== "all") {
    activeFilters.push({ key: "quality", label: quality });
  }
  if (search) {
    activeFilters.push({ key: "search", label: `"${search}"` });
  }

  // Remove filter
  const removeFilter = (key: string) => {
    switch (key) {
      case "category":
        handleCategoryChange("all");
        break;
      case "quality":
        handleQualityChange("all");
        break;
      case "search":
        setSearch("");
        handleSearchChange("");
        break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setCategory("all");
    setQuality("all");
    updateUrlParams({});
    setPage(0);
    fetchScenepacks(0, false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar user={null} />

      <main className="flex-1 pt-16">
        {/* Page Header */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Browse{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">
                Scenepacks
              </span>
            </h1>
            <p className="text-zinc-400">
              Discover premium scenepacks for your video edits
            </p>
          </div>
        </section>

        {/* Sticky Filter Bar */}
        <div
          ref={filterBarRef}
          className={cn(
            "sticky top-16 z-40 transition-all duration-300",
            isFilterSticky
              ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
              : "bg-transparent"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Main Filter Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Search scenepacks..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-white/[0.06] rounded-lg text-white placeholder:text-zinc-500 focus:border-rose-500/50 focus:ring-rose-500/20 transition-all"
                />
                {search && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Pills - Horizontal Scroll */}
              <div className="flex-1 w-full lg:flex-none overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                <div className="flex items-center gap-2 min-w-max">
                  {CATEGORIES.map((cat) => {
                    const isActive = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => handleCategoryChange(cat.value)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                          isActive
                            ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                            : "bg-[#0A0A0A] border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/10"
                        )}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality, Sort, and View Toggle */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                {/* Quality Radio Pills */}
                <div className="flex items-center gap-1 p-1 bg-[#0A0A0A] border border-white/[0.06] rounded-lg">
                  {QUALITY_OPTIONS.slice(1).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleQualityChange(quality === opt.value ? "all" : opt.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                        quality === opt.value
                          ? "bg-rose-600/20 text-rose-400"
                          : "text-zinc-500 hover:text-white"
                      )}
                    >
                      {opt.name}
                    </button>
                  ))}
                  {quality === "all" && (
                    <span className="px-3 py-1.5 text-xs font-medium text-zinc-500">All</span>
                  )}
                </div>

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#0A0A0A] border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/10"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      {SORT_OPTIONS.find((s) => s.value === sort)?.name}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#0A0A0A] border-white/[0.06]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={cn(
                          "text-zinc-400 focus:text-white focus:bg-white/5 cursor-pointer",
                          sort === opt.value && "text-rose-400 bg-rose-500/10"
                        )}
                      >
                        {opt.name}
                        {sort === opt.value && (
                          <span className="ml-auto text-rose-400">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-[#0A0A0A] border border-white/[0.06] rounded-lg">
                  <button
                    onClick={() => handleViewModeChange("grid")}
                    className={cn(
                      "p-2 rounded-md transition-all duration-200",
                      viewMode === "grid"
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                        : "text-zinc-500 hover:text-white"
                    )}
                    title="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange("list")}
                    className={cn(
                      "p-2 rounded-md transition-all duration-200",
                      viewMode === "list"
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                        : "text-zinc-500 hover:text-white"
                    )}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            <AnimatePresence>
              {activeFilters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 mt-4 flex-wrap"
                >
                  <span className="text-sm text-zinc-500">Active filters:</span>
                  {activeFilters.map((filter) => (
                    <Badge
                      key={filter.key}
                      variant="secondary"
                      className="bg-white/5 border border-white/[0.06] text-zinc-300 hover:bg-white/10 pr-1"
                    >
                      {filter.label}
                      <button
                        onClick={() => removeFilter(filter.key)}
                        className="ml-2 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Count */}
            <div className="mt-4 text-sm text-zinc-500">
              <span className="text-white font-semibold">{total.toLocaleString()}</span> scenepacks found
            </div>
          </div>
        </div>

        {/* Results Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "flex flex-col gap-4"
                )}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <ScenepackCardSkeleton key={i} />
                ))}
              </div>
            ) : scenepacks.length === 0 ? (
              <EmptyState onClearFilters={clearAllFilters} />
            ) : (
              <>
                <motion.div
                  layout
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "flex flex-col gap-4"
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {scenepacks.map((scenepack, index) => (
                      <motion.div
                        key={scenepack.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.2,
                          delay: Math.min(index * 0.02, 0.2),
                        }}
                      >
                        {viewMode === "list" ? (
                          <ListCard scenepack={scenepack} />
                        ) : (
                          <Link href={`/scenepack/${scenepack.id}`}>
                            <ScenepackCard scenepack={scenepack} />
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Load more trigger */}
                <div ref={loadMoreRef} className="mt-8">
                  {isLoadingMore && (
                    <div
                      className={cn(
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                          : "flex flex-col gap-4"
                      )}
                    >
                      {Array.from({ length: 4 }).map((_, i) => (
                        <ScenepackCardSkeleton key={i} />
                      ))}
                    </div>
                  )}

                  {!hasMore && scenepacks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A0A0A] border border-white/[0.06] text-zinc-500 text-sm">
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        You&apos;ve reached the end
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Empty State Component with CSS-only geometric illustration
function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* CSS-only geometric illustration */}
      <div className="relative w-40 h-40 mb-8">
        {/* Outer circle */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-zinc-800 animate-[spin_20s_linear_infinite]" />
        
        {/* Middle square */}
        <div className="absolute inset-4 rounded-lg border border-zinc-700 rotate-45 flex items-center justify-center">
          <div className="w-8 h-8 bg-zinc-800 rounded-full -rotate-45" />
        </div>
        
        {/* Inner elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-zinc-700" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 rounded-full bg-zinc-700" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-3 h-3 rounded-full bg-zinc-700" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-3 h-3 rounded-full bg-zinc-700" />
        
        {/* Corner squares */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-zinc-700 rotate-45" />
        <div className="absolute top-4 right-4 w-2 h-2 bg-zinc-700 rotate-45" />
        <div className="absolute bottom-4 left-4 w-2 h-2 bg-zinc-700 rotate-45" />
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-zinc-700 rotate-45" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">No scenepacks found</h3>
      <p className="text-zinc-500 text-center max-w-md mb-6">
        We couldn&apos;t find any scenepacks matching your filters. Try adjusting your search or filters.
      </p>
      <Button
        onClick={onClearFilters}
        variant="outline"
        className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
      >
        Clear all filters
      </Button>
    </motion.div>
  );
}

// List Card Component
function ListCard({ scenepack }: { scenepack: ExtendedScenepack }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/scenepack/${scenepack.id}`}>
      <motion.article
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group flex gap-4 p-4 rounded-lg bg-[#0A0A0A] border transition-all duration-200 cursor-pointer",
          isHovered
            ? "border-rose-500/30 shadow-lg shadow-rose-500/5"
            : "border-white/[0.06]"
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-48 h-28 rounded-md overflow-hidden flex-shrink-0">
          {scenepack.thumbnailUrl ? (
            <Image
              src={scenepack.thumbnailUrl}
              alt={scenepack.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="192px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
              <span className="text-2xl font-black text-rose-600/20">ME17</span>
            </div>
          )}

          {/* Quality Badge */}
          {scenepack.quality && (
            <span
              className={cn(
                "absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded",
                scenepack.quality === "4K"
                  ? "bg-amber-500/20 text-amber-400"
                  : scenepack.quality === "FHD"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-zinc-700 text-zinc-300"
              )}
            >
              {scenepack.quality}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Title & Category */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className={cn(
                "font-semibold text-lg transition-colors duration-200 line-clamp-1",
                isHovered ? "text-rose-400" : "text-white"
              )}
            >
              {scenepack.title}
            </h3>
            <Badge
              variant="secondary"
              className="bg-white/5 text-zinc-400 border-0 text-xs flex-shrink-0"
            >
              {scenepack.category}
            </Badge>
          </div>

          {/* Description */}
          {scenepack.description && (
            <p className="text-zinc-500 text-sm line-clamp-2 mb-2">
              {scenepack.description}
            </p>
          )}

          {/* Tags */}
          {scenepack.tags && scenepack.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {scenepack.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded bg-white/5 text-zinc-500"
                >
                  {tag}
                </span>
              ))}
              {scenepack.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs rounded bg-white/5 text-zinc-500">
                  +{scenepack.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-auto text-sm">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Eye className="w-4 h-4" />
              {scenepack.views?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Download className="w-4 h-4" />
              {scenepack.downloads?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Heart className="w-4 h-4" />
              {scenepack.likes?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

// Main page component with Suspense
export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-black">
          <Navbar user={null} />
          <main className="flex-1 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ScenepackCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
