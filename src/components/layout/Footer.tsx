"use client";

import Link from "next/link";
import { Youtube, Twitter, Instagram, Github } from "lucide-react";

const SOCIALS = [
  { icon: Youtube, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Github, href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">MythicEditz</span>
                <span className="text-[#EF4444]">17</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 mb-5 max-w-xs">
              Premium scenepacks for video editors. Create, share, and elevate your edits.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-3">
              {["Browse", "Trending", "Upload"].map((l) => (
                <li key={l}>
                  <Link
                    href={`/${l.toLowerCase()}`}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-3">
              {["Anime", "Gaming", "Movies", "Music"].map((l) => (
                <li key={l}>
                  <Link
                    href={`/browse?category=${l.toLowerCase()}`}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Contact"].map((l) => (
                <li key={l}>
                  <Link
                    href={`/${l.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} MythicEditz17. All rights reserved.
          </p>
          <p className="text-xs text-zinc-700">
            Crafted with passion for video editors
          </p>
        </div>
      </div>
    </footer>
  );
}
