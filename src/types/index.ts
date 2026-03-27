export interface Scenepack {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  driveLink?: string | null;
  megaLink?: string | null;
  category: string;
  quality: string;
  tags: string;
  status: string;
  featured: boolean;
  views: number;
  downloads: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  likes?: { id: string }[];
  saves?: { id: string }[];
}

export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: string;
  banned: boolean;
  createdAt: Date;
}

export interface Category {
  name: string;
  count: number;
  icon?: string;
}

export const CATEGORIES = [
  { name: "Anime", value: "anime", icon: "🎬" },
  { name: "Gaming", value: "gaming", icon: "🎮" },
  { name: "Movies", value: "movies", icon: "🎥" },
  { name: "Music Videos", value: "music", icon: "🎵" },
  { name: "VFX", value: "vfx", icon: "✨" },
  { name: "Other", value: "other", icon: "📦" },
] as const;

export const QUALITY_OPTIONS = [
  { name: "HD (720p)", value: "HD" },
  { name: "Full HD (1080p)", value: "FHD" },
  { name: "4K (2160p)", value: "4K" },
] as const;
