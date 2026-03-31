"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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
  Crown,
  X,
  MessageCircle,
  Send,
  Trash2,
  Calendar,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  createdBy?: { id: string; name?: string; image?: string };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name?: string; image?: string };
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return date.toLocaleDateString();
}

function SkeletonPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="w-24 h-4 skeleton rounded mb-8" />
        <div className="grid lg:grid-cols-[1fr,360px] gap-8">
          <div className="space-y-6">
            <div className="aspect-video skeleton rounded-2xl" />
            <div className="h-24 skeleton rounded-xl" />
          </div>
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-8xl font-black text-[#EF4444]">404</h1>
        <p className="text-xl text-zinc-400 mt-4 mb-6">Pack not found</p>
        <Link href="/browse" className="text-[#EF4444] hover:underline text-lg">
          Browse all packs →
        </Link>
      </div>
    </div>
  );
}

export default function ScenepackDetailPage() {
  const params = useParams();
  const { data: session } = useSession();

  const [pack, setPack] = useState<Scenepack | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/scenepack/${params.id}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPack(data);
        setLiked(data.isLiked);
        setSaved(data.isSaved);

        const relRes = await fetch(`/api/scenepacks?category=${data.category}&limit=5`);
        if (relRes.ok) {
          const relData = await relRes.json();
          setRelated(relData.scenepacks?.filter((r: any) => r.id !== params.id).slice(0, 4) || []);
        }

        const comRes = await fetch(`/api/scenepack/${params.id}/comments?limit=20`);
        if (comRes.ok) {
          const comData = await comRes.json();
          setComments(comData.comments || []);
        }
      } catch {
        console.error("Failed to load");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  const handleLike = async () => {
    if (!session?.user) {
      toast.error("Sign in to like");
      return;
    }
    setLiking(true);
    setLiked(!liked);
    setPack((p) => (p ? { ...p, likes: liked ? p.likes - 1 : p.likes + 1 } : p));
    try {
      await fetch(`/api/scenepack/${params.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
    } catch {}
    setLiking(false);
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast.error("Sign in to save");
      return;
    }
    setSaving(true);
    setSaved(!saved);
    setPack((p) => (p ? { ...p, saves: saved ? p.saves - 1 : p.saves + 1 } : p));
    try {
      await fetch(`/api/scenepack/${params.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
    } catch {}
    setSaving(false);
  };

  const handleDownload = async (type: "drive" | "mega") => {
    await fetch(`/api/scenepack/${params.id}/download`, { method: "POST" });
    const link = type === "drive" ? pack?.driveLink : pack?.megaLink;
    if (link) {
      window.open(link, "_blank");
      toast.success("Download started");
      setPack((p) => (p ? { ...p, downloads: p.downloads + 1 } : p));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostComment = async () => {
    if (!session?.user) {
      toast.error("Sign in to comment");
      return;
    }
    if (!newComment.trim() || newComment.length > 500) return;

    setPosting(true);
    const temp: Comment = {
      id: "temp",
      content: newComment,
      createdAt: new Date().toISOString(),
      user: { id: session.user.id!, name: session.user.name || "You" },
    };
    setComments([temp, ...comments]);

    try {
      const res = await fetch(`/api/scenepack/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      setComments([data.comment, ...comments.filter((c) => c.id !== "temp")]);
      setNewComment("");
    } catch {
      setComments(comments.filter((c) => c.id !== "temp"));
      toast.error("Failed to post");
    }
    setPosting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
    try {
      await fetch(`/api/scenepack/${params.id}/comments/${commentId}`, { method: "DELETE" });
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  const ytId = pack?.previewUrl ? getYouTubeId(pack.previewUrl) : null;

  if (loading) return <SkeletonPage />;
  if (!pack) return <NotFound />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        <div className="grid lg:grid-cols-[1fr,360px] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Video/Thumbnail */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 cursor-pointer group"
              onClick={() => pack.previewUrl && setVideoOpen(true)}
            >
              {pack.thumbnailUrl ? (
                <Image src={pack.thumbnailUrl} alt={pack.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-zinc-700">ME17</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {pack.previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-black fill-black ml-1" />
                  </div>
                </div>
              )}

              {pack.featured && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-medium">Featured</span>
                </div>
              )}
            </motion.div>

            {/* Title & Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{pack.title}</h1>

              {/* Stats Row */}
              <div className="flex items-center gap-6 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {pack.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  {pack.downloads.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  {pack.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(pack.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>

            {/* Tags */}
            {pack.tags?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-2"
              >
                {pack.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-sm text-zinc-400 bg-zinc-900/50 rounded-full border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-zinc-400 whitespace-pre-line leading-relaxed">
                {pack.description || "No description provided."}
              </p>
            </motion.div>

            {/* Comments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-900/30 rounded-2xl border border-white/5 overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-zinc-500" />
                <span className="font-medium text-white">Comments</span>
                <span className="text-zinc-600 text-sm">({comments.length})</span>
              </div>

              {/* Input */}
              <div className="p-5 border-b border-white/5">
                {session?.user ? (
                  <div className="flex gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full min-h-[60px] p-3 bg-zinc-800/50 border border-white/5 rounded-xl text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-[#EF4444]/50 transition-colors"
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-zinc-600">{newComment.length}/500</span>
                        <Button
                          onClick={handlePostComment}
                          disabled={posting || !newComment.trim()}
                          size="sm"
                          className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-full px-5"
                        >
                          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-4">
                    <Link href="/auth/login" className="text-[#EF4444] hover:underline">
                      Sign in
                    </Link>{" "}
                    to comment
                  </p>
                )}
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-zinc-600 text-center py-8 text-sm">No comments yet. Be the first!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-5 border-b border-white/5 last:border-0">
                      <div className="flex gap-3">
                        <Link href={`/profile/${c.user.id}`}>
                          <Avatar className="w-8 h-8 hover:ring-2 ring-[#EF4444]/50 transition-all">
                            <AvatarImage src={c.user.image} />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                              {c.user.name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Link href={`/profile/${c.user.id}`} className="font-medium text-white hover:text-[#EF4444] transition-colors">
                              {c.user.name || "Anonymous"}
                            </Link>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-600">{formatTime(c.createdAt)}</span>
                              {(session?.user?.id === c.user.id || session?.user?.role === "admin") && (
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="text-zinc-600 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-zinc-400 mt-1.5 text-sm leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:sticky lg:top-24 space-y-5 h-fit">
            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5"
            >
              {/* Uploader */}
              <Link href={`/profile/${pack.createdBy?.id}`} className="flex items-center gap-3 group mb-6">
                <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-[#EF4444] transition-colors">
                  <AvatarImage src={pack.createdBy?.image} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-400">
                    {pack.createdBy?.name?.charAt(0).toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white group-hover:text-[#EF4444] transition-colors">
                    {pack.createdBy?.name || "MythicEditz17"}
                  </p>
                  <p className="text-xs text-zinc-500">Creator</p>
                </div>
              </Link>

              {/* Badges */}
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1.5 text-sm font-medium bg-zinc-800 rounded-full text-zinc-300">
                  {pack.quality}
                </span>
                <span className="px-3 py-1.5 text-sm font-medium bg-[#EF4444]/10 rounded-full text-[#EF4444] border border-[#EF4444]/20">
                  {pack.category}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-6">
                <Button
                  onClick={handleLike}
                  disabled={liking}
                  variant={liked ? "default" : "outline"}
                  className={`flex-1 rounded-xl ${
                    liked
                      ? "bg-[#EF4444] hover:bg-[#DC2626] text-white"
                      : "bg-zinc-800/50 border-white/5 hover:bg-zinc-800 text-zinc-300"
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Liked" : "Like"}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant={saved ? "default" : "outline"}
                  className={`flex-1 rounded-xl ${
                    saved
                      ? "bg-[#EF4444] hover:bg-[#DC2626] text-white"
                      : "bg-zinc-800/50 border-white/5 hover:bg-zinc-800 text-zinc-300"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 mr-2 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="rounded-xl bg-zinc-800/50 border-white/5 hover:bg-zinc-800 text-zinc-300"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                </Button>
              </div>

              {/* Download */}
              <div className="space-y-3">
                {pack.driveLink && (
                  <Button
                    onClick={() => handleDownload("drive")}
                    className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white py-6 rounded-xl font-semibold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download from Drive
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                )}
                {pack.megaLink && (
                  <Button
                    onClick={() => handleDownload("mega")}
                    variant="outline"
                    className="w-full bg-zinc-800/50 border-white/5 hover:bg-zinc-800 text-white py-6 rounded-xl font-semibold"
                  >
                    <Download className="w-4 h-4 mr-2 text-[#EF4444]" />
                    Download from Mega
                  </Button>
                )}
                {!pack.driveLink && !pack.megaLink && (
                  <p className="text-center text-zinc-500 py-6 text-sm">No download links available</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-white mb-6">Related Packs</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/scenepack/${r.id}`} className="group">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                    {r.thumbnailUrl ? (
                      <img
                        src={r.thumbnailUrl}
                        alt={r.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-lg font-bold text-zinc-700">ME17</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                      <h3 className="font-medium text-white text-sm line-clamp-1">{r.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-5xl bg-black border-zinc-800 p-0 overflow-hidden rounded-2xl">
          <div className="aspect-video">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : pack.previewUrl ? (
              <video src={pack.previewUrl} className="w-full h-full" autoPlay controls />
            ) : null}
          </div>
          <button
            onClick={() => setVideoOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
