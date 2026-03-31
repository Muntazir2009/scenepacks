"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, Upload, User, Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Browse", href: "/browse" },
  { name: "Trending", href: "/trending" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-black/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">MythicEditz</span>
                <span className="text-[#EF4444]">17</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    isActive(link.href)
                      ? "text-white bg-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              {/* Upload */}
              <Link
                href="/upload"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-semibold rounded-full transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">Upload</span>
              </Link>

              {/* User Menu */}
              {session?.user ? (
                <div className="relative">
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-white">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 rounded-2xl border border-white/10 py-2 opacity-0 invisible hover:opacity-100 hover:visible group-hover:opacity-100 group-hover:visible transition-all shadow-xl">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white">{session.user.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{session.user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={`/profile/${session.user.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      {session.user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-zinc-400 hover:text-white"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="pb-4"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search scenepacks..."
                    className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#EF4444]/50 transition-colors"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black pt-20 md:hidden"
          >
            <div className="p-6 space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-lg font-medium rounded-xl transition-colors ${
                    isActive(link.href)
                      ? "text-white bg-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-white/5">
                {session?.user ? (
                  <>
                    <Link
                      href={`/profile/${session.user.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-lg text-zinc-400 hover:text-white"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block px-4 py-3 text-lg text-red-400"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 py-3 text-center font-medium text-zinc-400 border border-white/10 rounded-xl"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 py-3 text-center font-medium text-white bg-[#EF4444] rounded-xl"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
