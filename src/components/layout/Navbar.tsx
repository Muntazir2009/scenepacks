"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  Upload,
  User,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Loader2,
  Package,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Nav links configuration
const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse", href: "/browse" },
  { name: "Trending", href: "/trending" },
];

// Search result type
interface SearchResult {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  category: string;
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // State management
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const user = session?.user;

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isSearchExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target)
      ) {
        setIsSearchExpanded(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchExpanded]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchExpanded(false);
        setSearchQuery("");
        setSearchResults([]);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/scenepacks?search=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.scenepacks || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search input (400ms as requested)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery) {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 400);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Check if a link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-14 glass border-b border-white/10 dark:border-white/10">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <motion.span
                className="font-bold text-xl"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-foreground dark:text-white">Mythic</span>
                <span className="text-[#E11D48]">Editz</span>
                <span className="text-[#E11D48]">17</span>
              </motion.span>
            </Link>

            {/* Desktop Navigation with Active Indicator */}
            <nav className="hidden md:flex items-center gap-1 relative">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors duration-200"
                  >
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navindicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#E11D48] rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Search & Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Expanding Search Bar */}
              <div ref={searchContainerRef} className="relative">
                <AnimatePresence mode="wait">
                  {isSearchExpanded ? (
                    <motion.div
                      initial={{ width: 40, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 40, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="relative"
                    >
                      <div className="relative flex items-center bg-white/60 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-[#E11D48]/50 transition-colors">
                        <Search className="absolute left-3 h-4 w-4 text-zinc-400" />
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search scenepacks..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-10 py-2 bg-transparent border-0 focus:ring-0 focus:outline-none text-foreground dark:text-white placeholder:text-zinc-400 text-sm"
                        />
                        {isSearching && (
                          <Loader2 className="absolute right-3 h-4 w-4 text-zinc-400 animate-spin" />
                        )}
                        {!isSearching && searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                            className="absolute right-3 text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Search Results Dropdown */}
                      <AnimatePresence>
                        {searchResults.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-lg overflow-hidden shadow-xl"
                          >
                            {searchResults.map((result, index) => (
                              <Link
                                key={result.id}
                                href={`/scenepack/${result.id}`}
                                onClick={() => {
                                  setIsSearchExpanded(false);
                                  setSearchQuery("");
                                  setSearchResults([]);
                                }}
                                className={`flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                                  index !== searchResults.length - 1
                                    ? "border-b border-black/5 dark:border-white/5"
                                    : ""
                                }`}
                              >
                                <div className="w-10 h-10 rounded bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                  {result.thumbnailUrl ? (
                                    <img
                                      src={result.thumbnailUrl}
                                      alt={result.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs text-zinc-400">
                                      {result.category.slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-foreground dark:text-white truncate">
                                    {result.title}
                                  </p>
                                  <p className="text-xs text-zinc-400 capitalize">
                                    {result.category}
                                  </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-zinc-400 ml-auto shrink-0" />
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSearchExpanded(true)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                      aria-label="Open search"
                    >
                      <Search className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Upload Button */}
              <Link href="/upload">
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white transition-colors">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </motion.div>
              </Link>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E11D48]/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
                    >
                      <Avatar className="h-9 w-9 ring-1 ring-black/10 dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/20 transition-all">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-[#E11D48] to-[#BE123C] text-white font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-black/10 dark:border-white/10"
                    align="end"
                    sideOffset={8}
                  >
                    <div className="flex items-center justify-start gap-3 p-3">
                      <Avatar className="h-9 w-9 ring-1 ring-black/10 dark:ring-white/10">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-[#E11D48] to-[#BE123C] text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-foreground dark:text-white">{user.name}</p>
                        <p className="text-xs text-zinc-400 truncate max-w-[140px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                    <DropdownMenuItem asChild className="text-zinc-600 dark:text-zinc-300 focus:text-foreground dark:focus:text-white focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer transition-colors">
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-3 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-zinc-600 dark:text-zinc-300 focus:text-foreground dark:focus:text-white focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer transition-colors">
                      <Link href="/profile?tab=packs" className="flex items-center">
                        <Package className="mr-3 h-4 w-4" />
                        My Packs
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild className="text-zinc-600 dark:text-zinc-300 focus:text-foreground dark:focus:text-white focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer transition-colors">
                        <Link href="/admin" className="flex items-center">
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-[#E11D48] focus:text-[#F43F5E] focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      className="text-zinc-600 dark:text-zinc-300 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button className="bg-[#E11D48] hover:bg-[#BE123C] text-white transition-colors">
                        Get Started
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-14" />

      {/* Mobile Menu Drawer (Vaul) */}
      <Drawer
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        direction="bottom"
      >
        <DrawerContent className="bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-black/10 dark:border-white/10 rounded-t-2xl max-h-[85vh]">
          <DrawerHeader className="border-b border-black/10 dark:border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-bold">
                <span className="text-foreground dark:text-white">Mythic</span>
                <span className="text-[#E11D48]">Editz</span>
                <span className="text-[#E11D48]">17</span>
              </DrawerTitle>
              <DrawerClose asChild>
                <button 
                  className="h-10 w-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* User Section at Top */}
          {user && (
            <div className="flex items-center gap-3 p-4 border-b border-black/10 dark:border-white/10">
              <Avatar className="h-12 w-12 ring-1 ring-black/10 dark:ring-white/10">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-[#E11D48] to-[#BE123C] text-white font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground dark:text-white">{user.name}</p>
                <p className="text-sm text-zinc-400">{user.email}</p>
              </div>
            </div>
          )}

          {/* Mobile Nav Links */}
          <div className="p-4 space-y-1">
            {navLinks.map((link, index) => {
              const isActive = isLinkActive(link.href);
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DrawerClose asChild>
                    <Link
                      href={link.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#E11D48]/10 text-[#E11D48]"
                          : "text-zinc-600 dark:text-zinc-300 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="font-medium">{link.name}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                      )}
                    </Link>
                  </DrawerClose>
                </motion.div>
              );
            })}

            {/* Upload Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.05 }}
              className="pt-2"
            >
              <DrawerClose asChild>
                <Link href="/upload" className="block">
                  <Button className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Scenepack
                  </Button>
                </Link>
              </DrawerClose>
            </motion.div>
          </div>

          {/* Mobile User Actions */}
          {user ? (
            <div className="p-4 border-t border-black/10 dark:border-white/10 space-y-1">
              <DrawerClose asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <Link
                  href="/profile?tab=packs"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <Package className="h-4 w-4" />
                  My Packs
                </Link>
              </DrawerClose>
              {user.role === "admin" && (
                <DrawerClose asChild>
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </DrawerClose>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#E11D48] hover:bg-[#E11D48]/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-black/10 dark:border-white/10 space-y-2">
              <DrawerClose asChild>
                <Link href="/auth/login" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-black/20 dark:border-white/20 text-foreground dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Sign In
                  </Button>
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white">
                    Get Started
                  </Button>
                </Link>
              </DrawerClose>
            </div>
          )}

          {/* Theme Toggle at Bottom */}
          <div className="p-4 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-zinc-600 dark:text-zinc-300">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
