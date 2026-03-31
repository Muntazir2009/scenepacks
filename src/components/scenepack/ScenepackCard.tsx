"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Heart, Download, Play } from "lucide-react";
import { toast } from "sonner";

export interface Scenepack {
  id: string;
  title: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  category: string;
  quality?: string;
  views: number;
  downloads: number;
  likes?: number;
  isLiked?: boolean;
}

interface Props {
  scenepack: Scenepack;
  priority?: boolean;
}

export default function ScenepackCard({ scenepack, priority }: Props) {
  const { data: session, status } = useSession();
  const [liked, setLiked] = useState(scenepack.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(scenepack.likes ?? 0);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      toast.error("Sign in to like");
      return;
    }
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await fetch(`/api/scenepack/${scenepack.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id }),
      });
    } catch {}
  };

  return (
    <Link href={`/scenepack/${scenepack.id}`} className="group block">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
        {/* Image */}
        {scenepack.thumbnailUrl ? (
          <Image
            src={scenepack.thumbnailUrl}
            alt={scenepack.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-zinc-700">ME17</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quality */}
        {scenepack.quality && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-medium bg-black/60 backdrop-blur-sm rounded text-white">
            {scenepack.quality}
          </span>
        )}

        {/* Like button */}
        <button
          onClick={handleLike}
          className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs transition-colors ${
            liked ? "text-[#EF4444]" : "text-white/70 hover:text-white"
          }`}
        >
          <Heart className={`w-3 h-3 ${liked ? "fill-current" : ""}`} />
          {likeCount > 0 && likeCount}
        </button>

        {/* Play button */}
        {scenepack.previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-5 h-5 text-black fill-black ml-0.5" />
            </div>
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-semibold text-white text-sm line-clamp-1">{scenepack.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
            <span className="capitalize">{scenepack.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {scenepack.downloads.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ScenepackCardSkeleton() {
  return <div className="aspect-video rounded-xl skeleton" />;
}
