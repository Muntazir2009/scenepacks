"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScenepackCard from "@/components/scenepack/ScenepackCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CATEGORIES = [
  { name: "All", value: "all" },
  { name: "Anime", value: "anime" },
  { name: "Gaming", value: "gaming" },
  { name: "Movies", value: "movies" },
  { name: "Music", value: "music" },
  { name: "VFX", value: "vfx" },
];

const QUALITY_OPTIONS = [
  { name: "All Quality", value: "all" },
  { name: "HD (720p)", value: "HD" },
  { name: "Full HD (1080p)", value: "FHD" },
  { name: "4K (2160p)", value: "4K" },
];

const SORT_OPTIONS = [
  { name: "Latest", value: "latest" },
  { name: "Trending", value: "trending" },
  { name: "Most Downloaded", value: "downloads" },
];

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
}

export default function BrowsePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [quality, setQuality] = useState("all");
  const [sort, setSort] = useState("latest");
  const [scenepacks, setScenepacks] = useState<Scenepack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const LIMIT = 12;

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
        if (search) params.append("search", search);
        params.append("sort", sort);
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
    [category, quality, search, sort]
  );

  // Initial fetch and when filters change
  useEffect(() => {
    setPage(0);
    fetchScenepacks(0, false);
  }, [category, quality, sort, fetchScenepacks]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchScenepacks(0, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
      { threshold: 0.1 }
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-red-900/30 bg-gradient-to-b from-red-950/10 to-transparent">
          <div className="container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Browse <span className="text-red-500">Scenepacks</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Discover premium scenepacks for your video edits. Filter by category,
                quality, and more.
              </p>
            </motion.div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search scenepacks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-red-900/30 focus:border-red-600 focus:ring-red-600/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex gap-3 items-center w-full md:w-auto">
                {/* Category Select */}
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full md:w-40 bg-gray-900/50 border-red-900/30 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-red-900/30">
                    {CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        className="text-white focus:text-red-400 focus:bg-red-600/10"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Quality Select */}
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger className="w-full md:w-36 bg-gray-900/50 border-red-900/30 text-white">
                    <SelectValue placeholder="Quality" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-red-900/30">
                    {QUALITY_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-white focus:text-red-400 focus:bg-red-600/10"
                      >
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Select */}
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full md:w-40 bg-gray-900/50 border-red-900/30 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-red-900/30">
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white focus:text-red-400 focus:bg-red-600/10"
                      >
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="md:hidden border-red-600/50 text-red-400"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-gray-900 border-red-900/30">
                    <SheetHeader>
                      <SheetTitle className="text-white">Filters</SheetTitle>
                      <SheetDescription className="text-gray-400">
                        Filter scenepacks by category and quality
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-white mb-3">Category</h4>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES.map((cat) => (
                            <Badge
                              key={cat.value}
                              variant={category === cat.value ? "default" : "outline"}
                              className={`cursor-pointer ${
                                category === cat.value
                                  ? "bg-red-600 text-white"
                                  : "border-red-600/30 text-gray-300"
                              }`}
                              onClick={() => setCategory(cat.value)}
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white mb-3">Quality</h4>
                        <div className="flex flex-wrap gap-2">
                          {QUALITY_OPTIONS.map((opt) => (
                            <Badge
                              key={opt.value}
                              variant={quality === opt.value ? "default" : "outline"}
                              className={`cursor-pointer ${
                                quality === opt.value
                                  ? "bg-red-600 text-white"
                                  : "border-red-600/30 text-gray-300"
                              }`}
                              onClick={() => setQuality(opt.value)}
                            >
                              {opt.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Results count */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing <span className="text-white font-medium">{scenepacks.length}</span>{" "}
                of <span className="text-white font-medium">{total}</span> scenepacks
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            ) : scenepacks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No scenepacks found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {scenepacks.map((scenepack, index) => (
                    <motion.div
                      key={scenepack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.5) }}
                    >
                      <ScenepackCard scenepack={scenepack} />
                    </motion.div>
                  ))}
                </div>

                {/* Load more trigger */}
                <div ref={loadMoreRef} className="flex items-center justify-center py-12">
                  {isLoadingMore && (
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                  )}
                  {!hasMore && scenepacks.length > 0 && (
                    <p className="text-gray-500">No more scenepacks to load</p>
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
