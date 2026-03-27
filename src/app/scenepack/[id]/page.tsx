"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Calendar,
  Tag,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Scenepack {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  category: string;
  quality: string;
  tags: string[];
  views: number;
  downloads: number;
  driveLink?: string;
  megaLink?: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
  likes: number;
  saves: number;
}

export default function ScenepackDetailPage() {
  const params = useParams();
  const [scenepack, setScenepack] = useState<Scenepack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchScenepack = async () => {
      try {
        const response = await fetch(`/api/scenepack/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch scenepack");
        }
        const data = await response.json();
        setScenepack(data);
      } catch (error) {
        console.error("Error fetching scenepack:", error);
        toast.error("Failed to load scenepack");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchScenepack();
    }
  }, [params.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    // For now, just toggle UI state
    // In production, this would call the API with user authentication
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed like" : "Added to likes");
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Saved to collection");
  };

  const handleDownload = async (type: "drive" | "mega") => {
    // Increment download count
    try {
      await fetch(`/api/scenepack/${params.id}/download`, {
        method: "POST",
      });
      // Update local state
      if (scenepack) {
        setScenepack({
          ...scenepack,
          downloads: scenepack.downloads + 1,
        });
      }
    } catch (error) {
      console.error("Error incrementing download:", error);
    }

    // Open link
    const link = type === "drive" ? scenepack?.driveLink : scenepack?.megaLink;
    if (link) {
      window.open(link, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!scenepack) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Scenepack Not Found</h1>
            <p className="text-gray-400 mb-4">The scenepack you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/browse">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Browse Scenepacks
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Back navigation */}
        <div className="border-b border-red-900/30">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-video rounded-xl overflow-hidden border border-red-900/30 bg-gray-900/50 relative group"
              >
                {scenepack.thumbnailUrl ? (
                  <img
                    src={scenepack.thumbnailUrl}
                    alt={scenepack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold text-red-600/20">ME17</span>
                  </div>
                )}

                {/* Play button overlay */}
                {scenepack.previewUrl && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-20 w-20 rounded-full bg-red-600/80 flex items-center justify-center">
                      <div className="h-0 w-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-white ml-1" />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Title and info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-red-600 text-white">
                    {scenepack.category.charAt(0).toUpperCase() + scenepack.category.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="border-red-600/30 text-red-400">
                    {scenepack.quality}
                  </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {scenepack.title}
                </h1>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-gray-400 text-sm mb-6">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {scenepack.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {scenepack.downloads.toLocaleString()} downloads
                  </span>
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    {scenepack.likes.toLocaleString()} likes
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(scenepack.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    className={`${
                      isLiked
                        ? "bg-red-600 text-white"
                        : "border-red-600/30 text-red-400 hover:bg-red-600/10"
                    }`}
                    onClick={handleLike}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                    onClick={handleSave}
                  >
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Share
                  </Button>
                </div>

                <Separator className="bg-red-900/30 my-6" />

                {/* Description */}
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <div className="text-gray-300 whitespace-pre-line">
                    {scenepack.description || "No description provided."}
                  </div>
                </div>

                <Separator className="bg-red-900/30 my-6" />

                {/* Tags */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-red-500" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {scenepack.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24"
              >
                <div className="glow-border rounded-xl bg-gray-900/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Download</h3>

                  {/* Download buttons */}
                  <div className="space-y-3">
                    {scenepack.driveLink && (
                      <button
                        onClick={() => handleDownload("drive")}
                        className="w-full"
                      >
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-6">
                          <Download className="h-5 w-5 mr-2" />
                          Google Drive
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </button>
                    )}

                    {scenepack.megaLink && (
                      <button
                        onClick={() => handleDownload("mega")}
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full border-red-600/30 text-red-400 hover:bg-red-600/10 py-6"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Mega
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </button>
                    )}

                    {!scenepack.driveLink && !scenepack.megaLink && (
                      <p className="text-gray-400 text-center py-4">
                        No download links available
                      </p>
                    )}
                  </div>

                  <Separator className="bg-red-900/30 my-6" />

                  {/* Uploader info */}
                  <div>
                    <h4 className="text-sm text-gray-400 mb-3">Uploaded by</h4>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                        {scenepack.createdBy?.name?.charAt(0).toUpperCase() || "M"}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {scenepack.createdBy?.name || "MythicEditz17"}
                        </p>
                        <p className="text-gray-500 text-sm">Verified Uploader</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-red-900/30 my-6" />

                  {/* Quality info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Quality</p>
                      <p className="text-white font-medium">{scenepack.quality}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="text-white font-medium">
                        {scenepack.category.charAt(0).toUpperCase() + scenepack.category.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
