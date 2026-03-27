"use client";

import Link from "next/link";
import { Github, Twitter, Youtube, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-red-900/30 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold">
                <span className="text-white">Mythic</span>
                <span className="text-red-600">Editz</span>
                <span className="text-red-500">17</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              Premium scenepack platform for video editors. Browse, preview, and download
              high-quality scenepacks with ease. Elevate your edits with MythicEditz17.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-red-900/30 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-600 transition-all duration-200"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-red-900/30 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-600 transition-all duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-red-900/30 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-600 transition-all duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-red-900/30 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-600 transition-all duration-200"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/browse"
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Browse All
                </Link>
              </li>
              <li>
                <Link
                  href="/trending"
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Trending
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Upload
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/category/anime"
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Anime
                </Link>
              </li>
              <li>
                <Link
                  href="/category/gaming"
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Gaming
                </Link>
              </li>
              <li>
                <Link
                  href="/category/movies"
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Movies
                </Link>
              </li>
              <li>
                <Link
                  href="/category/music"
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Music Videos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-red-900/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} MythicEditz17. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-red-500 transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-red-500 transition-colors text-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-gray-500 hover:text-red-500 transition-colors text-sm"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
