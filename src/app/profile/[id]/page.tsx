"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Download, Package, Shield, User, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import ScenepackCard, { ScenepackCardSkeleton } from "@/components/scenepack/ScenepackCard";
import { cn } from "@/lib/utils";

interface ProfileUser {
  id: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  role: string;
}

interface ProfileScenepack {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  category: string;
  quality: string;
  views: number;
  downloads: number;
  likes: number;
  status: string;
  createdAt: string;
}

interface ProfileData {
  user: ProfileUser;
  stats: {
    totalUploads: number;
    totalDownloads: number;
  };
  scenepacks: ProfileScenepack[];
  isOwnProfile: boolean;
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "approved" | "pending" | "rejected">("all");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [resolvedParams.id]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-yellow-500/20 text-yellow-400">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-red-500/20 text-red-400">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Filter scenepacks based on active tab
  const filteredScenepacks = profile?.scenepacks.filter((sp) => {
    if (activeTab === "all") return true;
    return sp.status === activeTab;
  }) || [];

  // Calculate counts for tabs
  const counts = {
    all: profile?.scenepacks.length || 0,
    approved: profile?.scenepacks.filter((sp) => sp.status === "approved").length || 0,
    pending: profile?.scenepacks.filter((sp) => sp.status === "pending").length || 0,
    rejected: profile?.scenepacks.filter((sp) => sp.status === "rejected").length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Profile Header Skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
            <div className="w-24 h-24 rounded-full bg-[#0A0A0A] border border-white/10 skeleton-shimmer" />
            <div className="space-y-3">
              <div className="w-48 h-8 rounded bg-[#0A0A0A] skeleton-shimmer" />
              <div className="w-32 h-4 rounded bg-[#0A0A0A] skeleton-shimmer" />
            </div>
          </div>
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6">
                <div className="w-12 h-12 rounded bg-white/5 skeleton-shimmer mb-3" />
                <div className="w-16 h-6 rounded bg-white/5 skeleton-shimmer" />
              </div>
            ))}
          </div>
          {/* Scenepacks Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ScenepackCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">User not found</h1>
          <p className="text-zinc-400 mb-6">This profile does not exist or has been removed.</p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors"
          >
            Browse Scenepacks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12"
        >
          {/* Avatar */}
          <div className="relative">
            {profile.user.image ? (
              <Image
                src={profile.user.image}
                alt={profile.user.name || "User"}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center text-3xl font-bold text-white border-2 border-white/10">
                {getInitials(profile.user.name)}
              </div>
            )}
            {/* Role Badge */}
            {profile.user.role === "admin" && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center border-2 border-black">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                {profile.user.name || "Anonymous User"}
              </h1>
              {profile.user.role === "admin" && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-rose-600 text-white uppercase tracking-wide">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(profile.user.createdAt)}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {/* Total Uploads */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-rose-600/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{profile.stats.totalUploads}</div>
            <div className="text-sm text-zinc-400">Total Uploads</div>
          </div>

          {/* Total Downloads */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-rose-600/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {profile.stats.totalDownloads.toLocaleString()}
            </div>
            <div className="text-sm text-zinc-400">Total Downloads</div>
          </div>

          {/* Approved */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{counts.approved}</div>
            <div className="text-sm text-zinc-400">Approved</div>
          </div>

          {/* Pending */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{counts.pending}</div>
            <div className="text-sm text-zinc-400">Pending</div>
          </div>
        </motion.div>

        {/* Tabs for Own Profile */}
        {profile.isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide"
          >
            {(["all", "approved", "pending", "rejected"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all",
                  activeTab === tab
                    ? "bg-rose-600 text-white"
                    : "bg-[#0A0A0A] border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/20"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
              </button>
            ))}
          </motion.div>
        )}

        {/* Scenepacks Grid */}
        {filteredScenepacks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredScenepacks.map((scenepack, index) => (
              <motion.div
                key={scenepack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative"
              >
                {/* Status Badge for own profile */}
                {profile.isOwnProfile && scenepack.status !== "approved" && (
                  <div className="absolute top-2 left-2 z-10">
                    {getStatusBadge(scenepack.status)}
                  </div>
                )}
                <Link href={`/scenepack/${scenepack.id}`}>
                  <ScenepackCard
                    scenepack={{
                      id: scenepack.id,
                      title: scenepack.title,
                      thumbnailUrl: scenepack.thumbnailUrl || undefined,
                      previewUrl: scenepack.previewUrl || undefined,
                      category: scenepack.category,
                      quality: scenepack.quality,
                      views: scenepack.views,
                      downloads: scenepack.downloads,
                      likes: scenepack.likes,
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No scenepacks found</h3>
            <p className="text-zinc-400 mb-6">
              {profile.isOwnProfile
                ? "You haven't uploaded any scenepacks yet."
                : "This user hasn't uploaded any scenepacks yet."}
            </p>
            {profile.isOwnProfile && (
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors"
              >
                Upload Your First Pack
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
