"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Menu, X, Search, Upload, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
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

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = session?.user;

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-red-900/30 bg-black/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.span
              className="text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
              style={{
                textShadow: "0 0 20px rgba(220, 38, 38, 0.5)",
              }}
            >
              <span className="text-white">Mythic</span>
              <span className="text-red-600">Editz</span>
              <span className="text-red-500">17</span>
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-red-500 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/browse"
              className="text-gray-300 hover:text-red-500 transition-colors duration-200"
            >
              Browse
            </Link>
            <Link
              href="/trending"
              className="text-gray-300 hover:text-red-500 transition-colors duration-200"
            >
              Trending
            </Link>
          </nav>

          {/* Search & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search scenepacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 bg-gray-900/50 border-red-900/30 focus:border-red-600 focus:ring-red-600/20 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Upload Button */}
            <Link href="/upload">
              <Button
                variant="outline"
                className="border-red-600/50 text-red-500 hover:bg-red-600/10 hover:text-red-400 hover:border-red-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </Link>

            {/* User Menu */}
            {status === "loading" ? (
              <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-red-600/50">
                      <AvatarImage src={user.image || ""} alt={user.name || ""} />
                      <AvatarFallback className="bg-red-600 text-white">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-gray-900 border-red-900/30"
                  align="end"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-red-900/30" />
                  <DropdownMenuItem className="text-gray-300 focus:text-red-500 focus:bg-red-600/10">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <DropdownMenuItem className="text-gray-300 focus:text-red-500 focus:bg-red-600/10 cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem className="text-gray-300 focus:text-red-500 focus:bg-red-600/10">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-red-900/30" />
                  <DropdownMenuItem 
                    className="text-red-500 focus:bg-red-600/10 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-red-500 hover:bg-red-600/10"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-red-900/30"
          >
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-red-500 transition-colors py-2"
              >
                Home
              </Link>
              <Link
                href="/browse"
                className="text-gray-300 hover:text-red-500 transition-colors py-2"
              >
                Browse
              </Link>
              <Link
                href="/trending"
                className="text-gray-300 hover:text-red-500 transition-colors py-2"
              >
                Trending
              </Link>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search scenepacks..."
                  className="w-full pl-10 bg-gray-900/50 border-red-900/30"
                />
              </div>
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="h-8 w-8 border-2 border-red-600/50">
                      <AvatarFallback className="bg-red-600 text-white text-sm">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/upload">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white mt-2">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full border-red-600/50 text-red-400"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" className="w-full border-red-600/50 text-red-500">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
