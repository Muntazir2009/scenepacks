"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Download, Eye, Heart, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Scenepack {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  views: number;
  downloads: number;
  likes: number;
  createdAt: Date;
  status: string;
}

interface ScenepackCardProps {
  scenepack: Scenepack;
  featured?: boolean;
}

export default function ScenepackCard({ scenepack, featured = false }: ScenepackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      className={`relative group ${featured ? "col-span-2 row-span-2" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg) scale(1.02)`
          : "perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)",
        transition: "transform 0.2s ease-out",
      }}
    >
      <Link href={`/scenepack/${scenepack.id}`}>
        <div
          className={`relative overflow-hidden rounded-xl border border-red-900/30 bg-gray-900/50 transition-all duration-300 ${
            isHovered ? "border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]" : ""
          }`}
        >
          {/* Thumbnail */}
          <div
            className={`relative overflow-hidden ${
              featured ? "aspect-video" : "aspect-[4/3]"
            }`}
          >
            {scenepack.thumbnailUrl ? (
              <Image
                src={scenepack.thumbnailUrl}
                alt={scenepack.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <span className="text-4xl font-bold text-red-600/30">ME17</span>
              </div>
            )}

            {/* Overlay on hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
            />

            {/* Stats on hover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-white text-sm">
                  <Eye className="h-4 w-4" />
                  {scenepack.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-white text-sm">
                  <Download className="h-4 w-4" />
                  {scenepack.downloads.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-white text-sm">
                  <Heart className="h-4 w-4" />
                  {scenepack.likes.toLocaleString()}
                </span>
              </div>
            </motion.div>

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <Badge
                variant="outline"
                className="bg-black/60 border-red-600/50 text-red-400 text-xs"
              >
                {scenepack.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">
              {scenepack.title}
            </h3>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {scenepack.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-gray-800 text-gray-400"
                >
                  {tag}
                </Badge>
              ))}
              {scenepack.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-400">
                  +{scenepack.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="flex gap-2"
            >
              <span className="flex-1 text-center py-2 rounded-lg bg-red-600/20 text-red-400 text-sm border border-red-600/30">
                View Details
              </span>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
