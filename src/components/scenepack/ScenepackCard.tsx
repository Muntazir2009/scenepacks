"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Heart, Play, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export interface Scenepack {
  id: string;
  title: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  category: string;
  quality: string;
  views: number;
  downloads: number;
  likes?: number;
  isLiked?: boolean;
}

interface ScenepackCardProps {
  scenepack: Scenepack;
  priority?: boolean;
}

export default function ScenepackCard({ 
  scenepack, 
  priority = false,
}: ScenepackCardProps) {
  const { data: session, status } = useSession();
  const [isLiked, setIsLiked] = useState(scenepack.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(scenepack.likes ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (status !== "authenticated" || !session?.user?.id) {
      toast.error("Please log in to like scenepacks");
      return;
    }
    
    if (isLiking) return;
    
    setIsLiking(true);
    
    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      const response = await fetch(`/api/scenepack/${scenepack.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id }),
      });
      
      if (!response.ok) {
        // Revert on error
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        toast.error("Failed to update like");
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoModalOpen(true);
  };

  const getQualityBadgeStyles = (quality: string) => {
    switch (quality?.toUpperCase()) {
      case 'HD':
        return 'bg-zinc-700 text-zinc-300';
      case 'FHD':
      case '1080P':
        return 'bg-blue-500/20 text-blue-400';
      case '4K':
      case '2160P':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-zinc-700 text-zinc-300';
    }
  };

  return (
    <>
      <article
        className="group relative rounded-lg bg-[#0A0A0A] border border-white/[0.06] overflow-hidden card-hover cursor-pointer"
      >
        {/* Thumbnail Container - 16/9 aspect ratio */}
        <div className="relative aspect-video overflow-hidden">
          {/* Thumbnail Image */}
          {scenepack.thumbnailUrl ? (
            <Image
              src={scenepack.thumbnailUrl}
              alt={scenepack.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
              <span className="text-4xl font-black text-rose-600/20 tracking-wider">ME17</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {/* Quality Badge - Top Left */}
          {scenepack.quality && (
            <span
              className={cn(
                "absolute top-3 left-3 px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wide",
                getQualityBadgeStyles(scenepack.quality)
              )}
            >
              {scenepack.quality}
            </span>
          )}

          {/* Like Button - Top Right */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={cn(
              "absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200",
              "bg-black/50 backdrop-blur-sm hover:bg-black/70",
              isLiked && "text-rose-500"
            )}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-200",
                isLiked && "fill-rose-500 text-rose-500"
              )}
            />
            {likeCount > 0 && (
              <span className="text-xs font-medium text-white/80">{likeCount.toLocaleString()}</span>
            )}
          </button>

          {/* Play Button Overlay - only if previewUrl exists */}
          {scenepack.previewUrl && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-200"
              onClick={handlePlayClick}
            >
              <div className="w-14 h-14 rounded-full bg-rose-600/0 group-hover:bg-rose-600/90 backdrop-blur-0 group-hover:backdrop-blur-sm flex items-center justify-center shadow-0 group-hover:shadow-lg group-hover:shadow-rose-600/30 transition-all duration-200 group-hover:scale-110 cursor-pointer">
                <Play className="w-6 h-6 text-white ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="white" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar - Always Visible */}
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-white/5">
          {/* Category Badge */}
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-white/5 text-zinc-400">
            {scenepack.category}
          </span>

          {/* Download Count */}
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Download className="w-3.5 h-3.5" />
            {scenepack.downloads.toLocaleString()}
          </span>
        </div>
      </article>

      {/* Video Preview Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full bg-[#0A0A0A] border-white/10 p-0 overflow-hidden">
          <div className="relative aspect-video w-full">
            {scenepack.previewUrl && (
              <video
                src={scenepack.previewUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
              />
            )}
          </div>
          <div className="px-4 py-3 border-t border-white/5">
            <h3 className="font-semibold text-white truncate">{scenepack.title}</h3>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Skeleton Component
export function ScenepackCardSkeleton() {
  return (
    <div className="rounded-lg bg-[#0A0A0A] border border-white/[0.06] overflow-hidden">
      {/* Thumbnail Skeleton - 16/9 aspect ratio */}
      <div className="relative aspect-video skeleton-shimmer" />
      
      {/* Bottom Bar Skeleton */}
      <div className="flex items-center justify-between px-3 py-2.5 border-t border-white/5">
        <div className="w-16 h-4 rounded bg-white/5 skeleton-shimmer" />
        <div className="w-12 h-4 rounded bg-white/5 skeleton-shimmer" />
      </div>
    </div>
  );
}
