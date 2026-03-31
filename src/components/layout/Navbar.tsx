"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, Upload, User, Menu, X, LogOut, Shield, Settings, Bookmark, LayoutDashboard } from "lucide-react";
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-white">MythicEditz</span>
                  <span className="text-rose-500">17</span>
                </span>
                {session?.user?.role === "admin" && (
                  <span className="absolute -top-1 -right-6 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
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
              <Link
                href="/search"
                className="p-2.5 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Upload */}
              <Link
                href="/upload"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-lg shadow-rose-500/25"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">Upload</span>
              </Link>

              {/* User Menu */}
              {session?.user ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-sm font-medium text-white ring-2 ring-white/10">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 py-2 shadow-xl shadow-black/50"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-medium text-white">{session.user.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{session.user.email}</p>
                          {session.user.role === "admin" && (
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-rose-500/20 text-rose-400">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="py-1">
                          <Link
                            href={`/profile/${session.user.id}`}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/saved"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Bookmark className="w-4 h-4" />
                            Saved
                          </Link>
                          {session.user.role === "admin" && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              signOut();
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-20 md:hidden"
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
                    {session.user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-lg text-rose-400 hover:bg-rose-500/10 rounded-xl"
                      >
                        <Settings className="w-5 h-5" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href={`/profile/${session.user.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-lg text-zinc-400 hover:text-white"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-lg text-zinc-400 hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-lg text-zinc-400 hover:text-white"
                    >
                      Saved
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
                      className="flex-1 py-3 text-center font-medium text-white bg-rose-500 rounded-xl"
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
