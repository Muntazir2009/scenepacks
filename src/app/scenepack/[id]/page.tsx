"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Eye,
  Heart,
  Bookmark,
  Share2,
  ExternalLink,
  Play,
  Check,
  Loader2,
  User,
  Crown,
  X,
  MessageCircle,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScenepackCard from "@/components/scenepack/ScenepackCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

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
  likes: number;
  saves: number;
  driveLink?: string;
  megaLink?: string;
  createdAt: string;
  featured?: boolean;
  isLiked: boolean;
  isSaved: boolean;
  createdBy?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

interface RelatedScenepack {
  id: string;
  title: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  category: string;
  quality?: string;
  views: number;
  downloads: number;
  likes?: number;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    image?: string;
  };
}

// Extract YouTube video ID from URL
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Check if URL is a YouTube link
function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

// Quality badge colors
function getQualityBadgeClass(quality: string): string {
  switch (quality.toUpperCase()) {
    case "4K":
      return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/40";
    case "FHD":
    case "1080P":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/40";
    case "HD":
    case "720P":
    default:
      return "bg-zinc-700/50 text-zinc-400 border border-zinc-600/50";
  }
}

// Relative time formatter
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// Loading Skeleton Component
function DetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="border-b border-black/10 dark:border-white/[0.06]">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-5 w-32 bg-zinc-200 dark:bg-zinc-900" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="aspect-video w-full rounded-xl bg-zinc-200 dark:bg-[#0A0A0A]" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 bg-zinc-200 dark:bg-[#0A0A0A] rounded-full" />
                <Skeleton className="h-7 w-16 bg-zinc-200 dark:bg-[#0A0A0A] rounded-full" />
              </div>
              <div className="bg-card dark:bg-[#0A0A0A] rounded-xl border border-black/10 dark:border-white/[0.06] p-6">
                <Skeleton className="h-6 w-28 bg-zinc-200 dark:bg-zinc-900 mb-4" />
                <Skeleton className="h-4 w-full bg-zinc-200 dark:bg-zinc-900 mb-2" />
                <Skeleton className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-900" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="sticky top-20 space-y-4">
                <div className="bg-card dark:bg-[#0A0A0A] rounded-xl border border-black/10 dark:border-white/[0.06] overflow-hidden">
                  <div className="p-6 border-b border-black/10 dark:border-white/[0.06]">
                    <Skeleton className="h-8 w-full bg-zinc-200 dark:bg-zinc-900" />
                  </div>
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-12 w-full bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// 404 Not Found Component
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="text-8xl font-black text-[#E11D48] mb-4 animate-glitch"
          >
            404
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Scenepack Not Found</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">
            The scenepack you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/browse">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="bg-[#E11D48] hover:bg-rose-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors">
                <ArrowLeft className="h-5 w-5" />
                Browse Scenepacks
              </button>
            </motion.div>
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

// Comments Section Component
function CommentsSection({ 
  scenepackId, 
  userId,
  userRole 
}: { 
  scenepackId: string;
  userId?: string;
  userRole?: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/scenepack/${scenepackId}/comments?page=${pageNum}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        if (pageNum === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [scenepackId]);

  const handleSubmitComment = async () => {
    if (!userId) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    if (newComment.length > 500) {
      toast.error("Comment must be under 500 characters");
      return;
    }

    setIsSubmitting(true);

    // Optimistic update
    const tempComment: Comment = {
      id: "temp-" + Date.now(),
      content: newComment,
      createdAt: new Date().toISOString(),
      user: {
        id: userId,
        name: "You",
      },
    };

    setComments(prev => [tempComment, ...prev]);

    try {
      const response = await fetch(`/api/scenepack/${scenepackId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        // Replace temp comment with real one
        setComments(prev => prev.map(c => c.id === tempComment.id ? data.comment : c));
        setNewComment("");
        toast.success("Comment posted!");
      } else {
        // Remove temp comment on error
        setComments(prev => prev.filter(c => c.id !== tempComment.id));
        toast.error("Failed to post comment");
      }
    } catch (error) {
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const previousComments = [...comments];
    setComments(prev => prev.filter(c => c.id !== commentId));

    try {
      const response = await fetch(`/api/scenepack/${scenepackId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Comment deleted");
      } else {
        setComments(previousComments);
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      setComments(previousComments);
      toast.error("Failed to delete comment");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-card dark:bg-[#0A0A0A] rounded-xl border border-black/10 dark:border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-black/10 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[#E11D48]" />
          <h3 className="text-lg font-semibold text-foreground dark:text-white">
            Comments
          </h3>
          <span className="text-zinc-500 text-sm">({comments.length})</span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="p-6 border-b border-black/10 dark:border-white/[0.06]">
        {userId ? (
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-[#E11D48] text-white font-semibold">
                Y
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full min-h-[80px] p-3 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg text-foreground dark:text-white placeholder:text-zinc-500 resize-none focus:outline-none focus:border-[#E11D48]/50 transition-colors"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-500">
                  {newComment.length}/500
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="bg-[#E11D48] hover:bg-[#BE123C] text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-zinc-500 dark:text-zinc-400">
              <Link href="/auth/login" className="text-[#E11D48] hover:underline">
                Sign in
              </Link>{" "}
              to leave a comment
            </p>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="divide-y divide-black/5 dark:divide-white/[0.06]">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 mb-2" />
                  <Skeleton className="h-4 w-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <div className="flex gap-3">
                <Link href={`/profile/${comment.user.id}`}>
                  <Avatar className="h-10 w-10 hover:ring-2 hover:ring-[#E11D48]/50 transition-all">
                    <AvatarImage src={comment.user.image} alt={comment.user.name || "User"} />
                    <AvatarFallback className="bg-[#E11D48]/80 text-white font-semibold">
                      {getInitials(comment.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/profile/${comment.user.id}`}>
                      <span className="font-medium text-foreground dark:text-white hover:text-[#E11D48] transition-colors">
                        {comment.user.name || "Anonymous"}
                      </span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                      {(userId === comment.user.id || userRole === "admin") && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-zinc-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 mt-1 break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="p-4 border-t border-black/10 dark:border-white/[0.06]">
          <Button
            variant="ghost"
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchComments(nextPage);
            }}
            className="w-full text-zinc-500 hover:text-foreground dark:hover:text-white"
          >
            Load more comments
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ScenepackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [scenepack, setScenepack] = useState<Scenepack | null>(null);
  const [relatedScenepacks, setRelatedScenepacks] = useState<RelatedScenepack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const youtubeId = scenepack?.previewUrl ? getYouTubeId(scenepack.previewUrl) : null;
  const isYouTubeVideo = scenepack?.previewUrl ? isYouTubeUrl(scenepack.previewUrl) : false;

  // Fetch scenepack data
  useEffect(() => {
    const fetchScenepack = async () => {
      try {
        const response = await fetch(`/api/scenepack/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setScenepack(null);
            return;
          }
          throw new Error("Failed to fetch scenepack");
        }
        const data = await response.json();
        setScenepack(data);
        setIsLiked(data.isLiked || false);
        setIsSaved(data.isSaved || false);

        // Fetch related scenepacks
        const relatedRes = await fetch(`/api/scenepacks?category=${data.category}&limit=5`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedScenepacks(
            relatedData.scenepacks
              ?.filter((sp: RelatedScenepack) => sp.id !== params.id)
              .slice(0, 4) || []
          );
        }
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
    if (!session?.user?.id) {
      toast.error("Please login to like packs");
      router.push("/auth/login");
      return;
    }

    setIsLikeLoading(true);
    try {
      const response = await fetch(`/api/scenepack/${params.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setScenepack((prev) =>
          prev ? { ...prev, likes: data.liked ? prev.likes + 1 : prev.likes - 1 } : prev
        );
        toast.success(data.liked ? "Added to likes" : "Removed like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      toast.error("Please login to save packs");
      router.push("/auth/login");
      return;
    }

    setIsSaveLoading(true);
    try {
      const response = await fetch(`/api/scenepack/${params.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
        setScenepack((prev) =>
          prev ? { ...prev, saves: data.saved ? prev.saves + 1 : prev.saves - 1 } : prev
        );
        toast.success(data.saved ? "Saved to collection" : "Removed from saved");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast.error("Failed to update save");
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleDownload = async (type: "drive" | "mega") => {
    try {
      await fetch(`/api/scenepack/${params.id}/download`, {
        method: "POST",
      });
      if (scenepack) {
        setScenepack({
          ...scenepack,
          downloads: scenepack.downloads + 1,
        });
      }
    } catch (error) {
      console.error("Error incrementing download:", error);
    }

    const link = type === "drive" ? scenepack?.driveLink : scenepack?.megaLink;
    if (link) {
      window.open(link, "_blank");
      toast.success("Download started!");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading || status === "loading") {
    return <DetailSkeleton />;
  }

  if (!scenepack) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-black">
      <Navbar />

      <main className="flex-1">
        {/* Back navigation */}
        <div className="border-b border-black/10 dark:border-white/[0.06]">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-[#E11D48] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Link>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 py-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - 65% */}
            <div className="lg:col-span-3 space-y-6">
              {/* Thumbnail with Play Button */}
              <motion.div variants={itemVariants} className="relative">
                <div 
                  className="relative aspect-video rounded-xl overflow-hidden bg-card dark:bg-[#0A0A0A] border border-black/10 dark:border-white/[0.06] cursor-pointer group"
                  onClick={() => scenepack.previewUrl && setIsVideoModalOpen(true)}
                >
                  {scenepack.thumbnailUrl ? (
                    <Image
                      src={scenepack.thumbnailUrl}
                      alt={scenepack.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                      <span className="text-6xl font-black text-[#E11D48]/20 tracking-wider">ME17</span>
                    </div>
                  )}

                  {scenepack.previewUrl && (
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  )}

                  {scenepack.previewUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-20 h-20 rounded-full bg-[#E11D48]/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-[#E11D48]/40 group-hover:bg-[#E11D48] transition-colors"
                      >
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </motion.div>
                    </div>
                  )}

                  {scenepack.featured && (
                    <div className="absolute top-4 right-4 z-20">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 backdrop-blur-sm">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-400">Featured</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Tag Pills */}
              <motion.div variants={itemVariants}>
                <div className="flex flex-wrap gap-2">
                  {scenepack.tags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-card dark:bg-[#0A0A0A] text-zinc-600 dark:text-zinc-300 border border-black/10 dark:border-white/[0.06] hover:border-[#E11D48]/50 hover:text-[#E11D48] transition-all cursor-pointer px-4 py-1.5"
                      >
                        {tag}
                      </Badge>
                    </motion.div>
                  ))}
                  {scenepack.tags.length === 0 && (
                    <span className="text-zinc-500 text-sm">No tags available</span>
                  )}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">Description</h3>
                <div className="bg-card dark:bg-[#0A0A0A] rounded-xl border border-black/10 dark:border-white/[0.06] p-6">
                  <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed m-0">
                      {scenepack.description || "No description provided for this scenepack."}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Comments Section */}
              <motion.div variants={itemVariants}>
                <CommentsSection 
                  scenepackId={scenepack.id} 
                  userId={session?.user?.id}
                  userRole={session?.user?.role}
                />
              </motion.div>
            </div>

            {/* Right Column - 35% - Sticky Sidebar */}
            <div className="lg:col-span-2">
              <motion.div
                variants={itemVariants}
                className="sticky top-20 space-y-4"
              >
                {/* Main Info Card */}
                <div className="bg-card dark:bg-[#0A0A0A] rounded-xl border border-black/10 dark:border-white/[0.06] overflow-hidden">
                  {/* Title */}
                  <div className="p-6 border-b border-black/10 dark:border-white/[0.06]">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white leading-tight">
                      {scenepack.title}
                    </h1>
                  </div>

                  {/* Uploader Info */}
                  <div className="p-6 border-b border-black/10 dark:border-white/[0.06]">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Uploaded by</p>
                    <Link 
                      href={`/profile/${scenepack.createdBy?.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar className="h-10 w-10 border-2 border-[#E11D48]/50 group-hover:border-[#E11D48] transition-colors">
                        <AvatarImage src={scenepack.createdBy?.image} alt={scenepack.createdBy?.name || "User"} />
                        <AvatarFallback className="bg-[#E11D48] text-white font-bold">
                          {scenepack.createdBy?.name?.charAt(0).toUpperCase() || "M"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-foreground dark:text-white font-medium group-hover:text-[#E11D48] transition-colors">
                          {scenepack.createdBy?.name || "MythicEditz17"}
                        </p>
                        <p className="text-zinc-500 text-sm flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Verified Uploader
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Quality & Category Badges */}
                  <div className="p-6 border-b border-black/10 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <Badge className={getQualityBadgeClass(scenepack.quality)}>
                        {scenepack.quality}
                      </Badge>
                      <Badge className="bg-[#E11D48]/20 text-[#E11D48] border border-[#E11D48]/40">
                        {scenepack.category.charAt(0).toUpperCase() + scenepack.category.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="p-6 border-b border-black/10 dark:border-white/[0.06]">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                          <Eye className="h-4 w-4" />
                        </div>
                        <p className="text-foreground dark:text-white font-semibold tabular-nums">{scenepack.views.toLocaleString()}</p>
                        <p className="text-xs text-zinc-500">Views</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                          <Download className="h-4 w-4" />
                        </div>
                        <p className="text-foreground dark:text-white font-semibold tabular-nums">{scenepack.downloads.toLocaleString()}</p>
                        <p className="text-xs text-zinc-500">Downloads</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                          <Heart className="h-4 w-4" />
                        </div>
                        <p className="text-foreground dark:text-white font-semibold tabular-nums">{scenepack.likes.toLocaleString()}</p>
                        <p className="text-xs text-zinc-500">Likes</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                          <Bookmark className="h-4 w-4" />
                        </div>
                        <p className="text-foreground dark:text-white font-semibold tabular-nums">{scenepack.saves.toLocaleString()}</p>
                        <p className="text-xs text-zinc-500">Saves</p>
                      </div>
                    </div>
                  </div>

                  {/* Like & Save Buttons */}
                  <div className="p-6 border-b border-black/10 dark:border-white/[0.06]">
                    <div className="flex gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <button
                          className={`w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                            isLiked
                              ? "bg-[#E11D48] text-white"
                              : "bg-transparent border border-black/20 dark:border-white/20 text-zinc-600 dark:text-zinc-300 hover:bg-[#E11D48]/10 hover:border-[#E11D48]/50 hover:text-[#E11D48]"
                          }`}
                          onClick={handleLike}
                          disabled={isLikeLoading}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={isLiked ? "liked" : "unliked"}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                            </motion.div>
                          </AnimatePresence>
                          {isLikeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLiked ? "Liked" : "Like"}
                        </button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <button
                          className={`w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                            isSaved
                              ? "bg-[#E11D48] text-white"
                              : "bg-transparent border border-black/20 dark:border-white/20 text-zinc-600 dark:text-zinc-300 hover:bg-[#E11D48]/10 hover:border-[#E11D48]/50 hover:text-[#E11D48]"
                          }`}
                          onClick={handleSave}
                          disabled={isSaveLoading}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={isSaved ? "saved" : "unsaved"}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                            </motion.div>
                          </AnimatePresence>
                          {isSaveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSaved ? "Saved" : "Save"}
                        </button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <button
                          className="py-2.5 px-4 rounded-lg bg-transparent border border-black/20 dark:border-white/20 text-zinc-600 dark:text-zinc-300 hover:bg-[#E11D48]/10 hover:border-[#E11D48]/50 hover:text-[#E11D48] transition-all"
                          onClick={handleCopyLink}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={copied ? "copied" : "copy"}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                            </motion.div>
                          </AnimatePresence>
                        </button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div className="p-6 space-y-3">
                    {scenepack.driveLink && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload("drive")}
                        className="w-full"
                      >
                        <div className="relative group">
                          <div className="absolute inset-0 bg-[#E11D48] rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                          <div className="relative flex items-center justify-center gap-3 bg-[#E11D48] hover:bg-rose-600 text-white font-semibold py-4 px-6 rounded-lg transition-all">
                            <Download className="h-5 w-5" />
                            <span>Download from Drive</span>
                            <ExternalLink className="h-4 w-4 ml-auto" />
                          </div>
                        </div>
                      </motion.button>
                    )}

                    {scenepack.megaLink && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload("mega")}
                        className="w-full"
                      >
                        <div className="flex items-center justify-center gap-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-black/10 dark:border-white/[0.06] text-foreground dark:text-white font-medium py-4 px-6 rounded-lg transition-all">
                          <Download className="h-5 w-5 text-[#E11D48]" />
                          <span>Download from Mega</span>
                          <ExternalLink className="h-4 w-4 ml-auto text-zinc-400" />
                        </div>
                      </motion.button>
                    )}

                    {!scenepack.driveLink && !scenepack.megaLink && (
                      <div className="text-center py-8">
                        <Download className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
                        <p className="text-zinc-500">No download links available</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related Scenepacks Section */}
          {relatedScenepacks.length > 0 && (
            <motion.section
              variants={itemVariants}
              className="mt-16"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground dark:text-white">
                  Related Scenepacks
                </h2>
                <Link
                  href={`/browse?category=${scenepack.category}`}
                  className="text-[#E11D48] hover:text-rose-400 transition-colors text-sm flex items-center gap-1"
                >
                  View all
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                  {relatedScenepacks.map((related, index) => (
                    <motion.div
                      key={related.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ScenepackCard scenepack={related} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </motion.div>
      </main>

      <Footer />

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-5xl w-full bg-white dark:bg-black border-black/10 dark:border-white/[0.06] p-0 overflow-hidden">
          <div className="relative aspect-video bg-black">
            {isYouTubeVideo && youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : scenepack.previewUrl ? (
              <video
                src={scenepack.previewUrl}
                className="w-full h-full object-contain bg-black"
                autoPlay
                controls
                controlsList="nodownload"
              />
            ) : null}
          </div>
          <button
            onClick={() => setIsVideoModalOpen(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#E11D48] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
