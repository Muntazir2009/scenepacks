"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  Download,
  FileVideo,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2,
  Eye,
  Upload,
  UserPlus,
  Activity,
  Clock,
  TrendingUp,
  BarChart3,
  Sparkles,
  Star,
  Settings,
  BarChart2,
  FileDown,
  Trash2,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Megaphone,
  Save,
  Ban,
  Shield,
  ShieldOff,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

interface AdminStats {
  totalScenepacks: number;
  totalUsers: number;
  totalDownloads: number;
  totalViews: number;
  pendingApprovals: number;
}

interface Scenepack {
  id: string;
  title: string;
  category: string;
  quality: string;
  status: string;
  featured: boolean;
  views: number;
  downloads: number;
  thumbnailUrl?: string;
  createdAt: string;
  uploader?: { name: string; email: string };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
  updatedAt?: string;
  image?: string;
  scenepackCount?: number;
  lastActivity?: string;
}

interface ActivityItem {
  id: string;
  action: string;
  message: string;
  userId: string | null;
  targetId: string | null;
  createdAt: string;
}

interface AnalyticsData {
  topDownloaded: Array<{ id: string; title: string; downloads: number; category: string }>;
  topViewed: Array<{ id: string; title: string; views: number; category: string }>;
  downloadsOverTime: Array<{ date: string; downloads: number }>;
  usersOverTime: Array<{ date: string; users: number }>;
}

interface PlatformSettings {
  id: string;
  requireApproval: boolean;
  allowMegaLinks: boolean;
  maintenanceMode: boolean;
  announcementBanner: string | null;
}

interface AdminData {
  stats: AdminStats;
  pendingScenepacks: Scenepack[];
  recentUsers: User[];
  allScenepacks: Scenepack[];
  signupsPerDay: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
  newestUser: { id: string; name: string; email: string; createdAt: string } | null;
}

// Animated counter component with spring animation
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration, type: "spring", stiffness: 100 });
    
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, count, rounded]);

  return <span>{displayValue.toLocaleString()}</span>;
}

// Stat card with glow effect
function StatCard({
  title,
  value,
  icon: Icon,
  suffix = "",
  trend,
  delay = 0,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  suffix?: string;
  trend?: string;
  delay?: number;
}) {
  const displayValue = suffix === "K" ? `${(value / 1000).toFixed(0)}K` : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-[#0A0A0A] ring-1 ring-white/10 group relative overflow-hidden transition-all duration-300 hover:ring-rose-500/50 hover:shadow-[0_0_30px_rgba(225,29,72,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm text-zinc-400">{title}</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-rose-600/20 flex items-center justify-center group-hover:bg-rose-600/30 transition-colors duration-300">
            <Icon className="h-4 w-4 text-rose-500" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-white">
            {typeof displayValue === "number" ? (
              <>
                <AnimatedCounter value={value} />
                {suffix && suffix !== "K" && suffix}
              </>
            ) : (
              displayValue
            )}
          </div>
          {trend && (
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Activity feed item component
function ActivityFeedItem({ activity, index }: { activity: ActivityItem; index: number }) {
  const getIcon = () => {
    switch (activity.action) {
      case "upload":
      case "bulk_upload":
        return <Upload className="h-4 w-4 text-blue-400" />;
      case "approve":
      case "bulk_approve":
      case "approve_all_pending":
        return <Check className="h-4 w-4 text-green-400" />;
      case "reject":
      case "bulk_reject":
        return <X className="h-4 w-4 text-red-400" />;
      case "signup":
        return <UserPlus className="h-4 w-4 text-purple-400" />;
      case "feature_random":
        return <Star className="h-4 w-4 text-yellow-400" />;
      case "delete":
      case "bulk_delete":
        return <Trash2 className="h-4 w-4 text-red-400" />;
      case "ban":
        return <Ban className="h-4 w-4 text-red-400" />;
      case "unban":
        return <Shield className="h-4 w-4 text-green-400" />;
      default:
        return <Activity className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getBgColor = () => {
    switch (activity.action) {
      case "upload":
      case "bulk_upload":
        return "bg-blue-500/10 ring-1 ring-blue-500/20";
      case "approve":
      case "bulk_approve":
      case "approve_all_pending":
        return "bg-green-500/10 ring-1 ring-green-500/20";
      case "reject":
      case "bulk_reject":
        return "bg-red-500/10 ring-1 ring-red-500/20";
      case "signup":
        return "bg-purple-500/10 ring-1 ring-purple-500/20";
      case "feature_random":
        return "bg-yellow-500/10 ring-1 ring-yellow-500/20";
      case "delete":
      case "bulk_delete":
      case "ban":
        return "bg-red-500/10 ring-1 ring-red-500/20";
      case "unban":
        return "bg-green-500/10 ring-1 ring-green-500/20";
      default:
        return "bg-zinc-500/10 ring-1 ring-zinc-500/20";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex items-start gap-3 p-3 rounded-lg ${getBgColor()} transition-all duration-200 hover:scale-[1.02]`}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 truncate">{activity.message}</p>
        <p className="text-xs text-zinc-500 mt-1">{formatTime(activity.createdAt)}</p>
      </div>
    </motion.div>
  );
}

// Loading skeleton for stat cards
function StatCardSkeleton() {
  return (
    <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24 bg-zinc-800" />
        <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 bg-zinc-800" />
      </CardContent>
    </Card>
  );
}

// Loading skeleton for activity feed
function ActivityFeedSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg ring-1 ring-white/10 bg-zinc-900/30">
          <Skeleton className="h-4 w-4 rounded bg-zinc-800" />
          <div className="flex-1">
            <Skeleton className="h-4 w-full bg-zinc-800" />
            <Skeleton className="h-3 w-16 mt-2 bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload?: { fill?: string } }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0A0A] ring-1 ring-white/10 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium">{label}</p>
        <p className="text-rose-400 text-sm">{payload[0].value} scenepacks</p>
      </div>
    );
  }
  return null;
};

// Line chart tooltip
const LineTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0A0A] ring-1 ring-white/10 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

// Editable title component
function EditableTitle({ 
  title, 
  onSave, 
  id 
}: { 
  title: string; 
  onSave: (newTitle: string) => void; 
  id: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="bg-transparent border-b border-rose-500 text-white font-medium outline-none w-full min-w-0"
      />
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)} 
      className="text-white font-medium cursor-pointer hover:text-rose-400 transition-colors"
      title="Click to edit"
    >
      {title}
    </span>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [data, setData] = useState<AdminData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [announcementBanner, setAnnouncementBanner] = useState("");
  const [selectedScenepacks, setSelectedScenepacks] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [allScenepacks, setAllScenepacks] = useState<Scenepack[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch admin data with polling
  const fetchAdminData = useCallback(async () => {
    try {
      const response = await fetch("/api/admin");
      if (!response.ok) throw new Error("Failed to fetch admin data");
      const result = await response.json();
      setData(result);
      setAllScenepacks(result.allScenepacks || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Polling every 60 seconds for real-time stats
  useEffect(() => {
    pollingRef.current = setInterval(fetchAdminData, 60000);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchAdminData]);

  // Fetch activity feed with polling
  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch("/api/activity");
      if (!response.ok) throw new Error("Failed to fetch activity");
      const result = await response.json();
      setActivities(result.activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    
    // Poll every 30 seconds
    const activityPolling = setInterval(fetchActivities, 30000);
    
    return () => {
      clearInterval(activityPolling);
    };
  }, [fetchActivities]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const response = await fetch("/api/admin/analytics");
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const result = await response.json();
        setAnalytics(result);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users?limit=100");
        if (!response.ok) throw new Error("Failed to fetch users");
        const result = await response.json();
        setAllUsers(result.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const result = await response.json();
        setSettings(result);
        setAnnouncementBanner(result.announcementBanner || "");
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    if (activeTab === "settings") {
      fetchSettings();
    }
  }, [activeTab]);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedScenepacks(new Set(allScenepacks.map(sp => sp.id)));
    } else {
      setSelectedScenepacks(new Set());
    }
  }, [selectAll, allScenepacks]);

  // Toggle individual selection
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedScenepacks);
    if (newSet.has(id)) {
      newSet.delete(id);
      setSelectAll(false);
    } else {
      newSet.add(id);
      if (newSet.size === allScenepacks.length) {
        setSelectAll(true);
      }
    }
    setSelectedScenepacks(newSet);
  };

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) throw new Error("Failed to approve");
      toast.success("Scenepack approved!");
      fetchAdminData();
      fetchActivities();
    } catch {
      toast.error("Failed to approve scenepack");
    }
  };

  // Handle reject
  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (!response.ok) throw new Error("Failed to reject");
      toast.success("Scenepack rejected");
      fetchAdminData();
      fetchActivities();
    } catch {
      toast.error("Failed to reject scenepack");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scenepack?")) return;
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Scenepack deleted");
      fetchAdminData();
      fetchActivities();
    } catch {
      toast.error("Failed to delete scenepack");
    }
  };

  // Handle feature toggle
  const handleFeatureToggle = async (id: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !featured }),
      });
      if (!response.ok) throw new Error("Failed to update");
      toast.success(featured ? "Unfeatured scenepack" : "Featured scenepack");
      fetchAdminData();
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  // Handle title edit
  const handleTitleSave = async (id: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!response.ok) throw new Error("Failed to update");
      toast.success("Title updated");
      fetchAdminData();
    } catch {
      toast.error("Failed to update title");
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action: string) => {
    if (selectedScenepacks.size === 0) {
      toast.error("No scenepacks selected");
      return;
    }

    const confirmMsg = action === "delete" 
      ? `Delete ${selectedScenepacks.size} scenepack(s)?` 
      : `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedScenepacks.size} scenepack(s)?`;
    
    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch("/api/admin/scenepacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selectedScenepacks) }),
      });
      if (!response.ok) throw new Error("Failed to perform action");
      toast.success(`Successfully ${action}ed ${selectedScenepacks.size} scenepack(s)`);
      setSelectedScenepacks(new Set());
      setSelectAll(false);
      fetchAdminData();
      fetchActivities();
    } catch {
      toast.error("Failed to perform bulk action");
    }
  };

  // Handle approve all pending
  const handleApproveAllPending = async () => {
    if (!confirm("Approve all pending scenepacks?")) return;
    try {
      const response = await fetch("/api/admin/scenepacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approveAllPending", ids: [] }),
      });
      if (!response.ok) throw new Error("Failed to approve all");
      const result = await response.json();
      toast.success(`Approved ${result.result.count} pending scenepacks`);
      fetchAdminData();
      fetchActivities();
    } catch {
      toast.error("Failed to approve all pending");
    }
  };

  // Handle feature random
  const handleFeatureRandom = async () => {
    try {
      const response = await fetch("/api/admin/scenepacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "featureRandom", ids: [] }),
      });
      if (!response.ok) throw new Error("Failed to feature random");
      const result = await response.json();
      if (result.result.featuredPack) {
        toast.success(`Featured: ${result.result.featuredPack.title}`);
      } else {
        toast.info("No non-featured scenepacks available");
      }
      fetchAdminData();
      fetchActivities();
    } catch {
      toast.error("Failed to feature random pack");
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      toast.success("Role updated");
      // Refresh users list
      const usersResponse = await fetch("/api/admin/users?limit=100");
      const usersResult = await usersResponse.json();
      setAllUsers(usersResult.users);
    } catch {
      toast.error("Failed to update role");
    }
  };

  // Handle ban/unban
  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    if (!confirm(currentlyBanned ? "Unban this user?" : "Ban this user?")) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !currentlyBanned }),
      });
      if (!response.ok) throw new Error("Failed to update ban status");
      toast.success(currentlyBanned ? "User unbanned" : "User banned");
      // Refresh users list
      const usersResponse = await fetch("/api/admin/users?limit=100");
      const usersResult = await usersResponse.json();
      setAllUsers(usersResult.users);
      fetchActivities();
    } catch {
      toast.error("Failed to update ban status");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["ID", "Title", "Category", "Quality", "Status", "Featured", "Views", "Downloads", "Created At", "Uploader"];
    const rows = allScenepacks.map(sp => [
      sp.id,
      `"${sp.title}"`,
      sp.category,
      sp.quality,
      sp.status,
      sp.featured ? "Yes" : "No",
      sp.views,
      sp.downloads,
      new Date(sp.createdAt).toISOString(),
      sp.uploader?.name || "Unknown"
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scenepacks-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  // Save announcement banner
  const saveAnnouncementBanner = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementBanner }),
      });
      if (!response.ok) throw new Error("Failed to save");
      toast.success("Announcement banner saved");
      fetchActivities();
    } catch {
      toast.error("Failed to save announcement banner");
    }
  };

  // Update setting
  const updateSetting = async (key: keyof PlatformSettings, value: boolean) => {
    try {
      setSettingsLoading(true);
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!response.ok) throw new Error("Failed to update");
      setSettings(prev => prev ? { ...prev, [key]: value } : null);
      toast.success("Setting updated");
    } catch {
      toast.error("Failed to update setting");
    } finally {
      setSettingsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            <p className="text-zinc-400">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="h-12 w-12 rounded-xl bg-rose-600 flex items-center justify-center relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <LayoutDashboard className="h-6 w-6 text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-rose-600"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Admin Panel
                    <Sparkles className="h-5 w-5 text-rose-500 animate-pulse" />
                  </h1>
                  <p className="text-zinc-400">Manage your platform</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { fetchAdminData(); fetchActivities(); }}
                className="ring-1 ring-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-[#0A0A0A] ring-1 ring-white/10">
                {["dashboard", "scenepacks", "users", "analytics", "settings"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-zinc-400 transition-all duration-200"
                  >
                    {tab === "analytics" ? <BarChart2 className="h-4 w-4 mr-2 inline" /> : null}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {isLoading ? (
                    <>
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                    </>
                  ) : (
                    <>
                      <StatCard
                        title="Total Scenepacks"
                        value={data?.stats?.totalScenepacks || 0}
                        icon={Package}
                        delay={0}
                      />
                      <StatCard
                        title="Total Users"
                        value={data?.stats?.totalUsers || 0}
                        icon={Users}
                        trend="+12% this month"
                        delay={0.1}
                      />
                      <StatCard
                        title="Total Downloads"
                        value={data?.stats?.totalDownloads || 0}
                        icon={Download}
                        suffix="K"
                        trend="+8% this week"
                        delay={0.2}
                      />
                      <StatCard
                        title="Pending Approvals"
                        value={data?.stats?.pendingApprovals || 0}
                        icon={FileVideo}
                        delay={0.3}
                      />
                    </>
                  )}
                </div>

                {/* Quick Actions Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-3"
                >
                  <Button
                    onClick={handleApproveAllPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={!data?.stats?.pendingApprovals}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve All Pending
                  </Button>
                  <Button
                    onClick={handleFeatureRandom}
                    variant="outline"
                    className="ring-1 ring-white/10"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Feature Random Pack
                  </Button>
                  {data?.newestUser && (
                    <Link href={`/profile/${data.newestUser.id}`}>
                      <Button variant="outline" className="ring-1 ring-white/10">
                        <UserPlus className="h-4 w-4 mr-2" />
                        View Newest User
                      </Button>
                    </Link>
                  )}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Signups Chart & Category Chart */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Signups per Day Line Chart */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-rose-500" />
                            Signups per Day (Last 30 Days)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={data?.signupsPerDay || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#71717a" 
                                  tick={{ fontSize: 10 }}
                                  tickFormatter={(value) => value.split("-").slice(1).join("/")}
                                />
                                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                                <Tooltip content={<LineTooltip />} />
                                <Line 
                                  type="monotone" 
                                  dataKey="count" 
                                  stroke="#e11d48" 
                                  strokeWidth={2}
                                  dot={false}
                                  name="Signups"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Category Distribution Chart */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-rose-500" />
                            Scenepacks by Category
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data?.categoryDistribution || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis type="number" stroke="#71717a" />
                                <YAxis dataKey="name" type="category" stroke="#71717a" width={60} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                  {(data?.categoryDistribution || []).map((_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"][index % 5]}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Pending Approvals */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <FileVideo className="h-5 w-5 text-rose-500" />
                            Pending Approvals
                            {data?.stats?.pendingApprovals ? (
                              <Badge className="bg-yellow-600 text-white ml-2">
                                {data.stats.pendingApprovals} pending
                              </Badge>
                            ) : null}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {data?.pendingScenepacks?.length === 0 ? (
                            <div className="text-center py-8 text-zinc-400">
                              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500/50" />
                              <p>No pending scenepacks</p>
                              <p className="text-sm text-zinc-500 mt-1">All caught up!</p>
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow className="ring-1 ring-white/5">
                                  <TableHead className="text-zinc-400">Title</TableHead>
                                  <TableHead className="text-zinc-400">Category</TableHead>
                                  <TableHead className="text-zinc-400">Uploader</TableHead>
                                  <TableHead className="text-zinc-400">Uploaded</TableHead>
                                  <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <AnimatePresence mode="popLayout">
                                  {(data?.pendingScenepacks || []).map((sp, index) => (
                                    <motion.tr
                                      key={sp.id}
                                      layout
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, x: -20 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="ring-1 ring-white/5"
                                    >
                                      <TableCell className="text-white font-medium">{sp.title}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="ring-rose-600/30 text-rose-400">
                                          {sp.category}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-zinc-300">{sp.uploader?.name || "Unknown"}</TableCell>
                                      <TableCell className="text-zinc-400">
                                        {new Date(sp.createdAt).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleApprove(sp.id)}
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="ring-rose-600/30 text-rose-400 hover:bg-rose-600/10"
                                            onClick={() => handleReject(sp.id)}
                                          >
                                            <XCircle className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </motion.tr>
                                  ))}
                                </AnimatePresence>
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Right Column - Activity Feed */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="bg-[#0A0A0A] ring-1 ring-white/10 h-full">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Activity className="h-5 w-5 text-rose-500" />
                          Activity Feed
                          <span className="relative flex h-2 w-2 ml-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activitiesLoading ? (
                          <ActivityFeedSkeleton />
                        ) : activities.length === 0 ? (
                          <div className="text-center py-8 text-zinc-400">
                            <Clock className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                            <p>No recent activity</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            <AnimatePresence mode="popLayout">
                              {activities.map((activity, index) => (
                                <ActivityFeedItem
                                  key={activity.id}
                                  activity={activity}
                                  index={index}
                                />
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Scenepacks Tab */}
              <TabsContent value="scenepacks" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">All Scenepacks</CardTitle>
                        <Button onClick={exportToCSV} variant="outline" size="sm" className="ring-1 ring-white/10">
                          <FileDown className="h-4 w-4 mr-2" />
                          Export to CSV
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Bulk Actions Toolbar */}
                      {selectedScenepacks.size > 0 && (
                        <div className="mb-4 p-3 bg-rose-600/10 ring-1 ring-rose-600/30 rounded-lg flex items-center gap-3">
                          <span className="text-sm text-rose-400">
                            {selectedScenepacks.size} selected
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleBulkAction("approve")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleBulkAction("reject")}
                            variant="outline"
                            className="ring-yellow-600/30 text-yellow-400"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleBulkAction("delete")}
                            variant="outline"
                            className="ring-red-600/30 text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setSelectedScenepacks(new Set()); setSelectAll(false); }}
                            className="text-zinc-400"
                          >
                            Clear
                          </Button>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="ring-1 ring-white/5">
                              <TableHead className="text-zinc-400 w-10">
                                <Checkbox
                                  checked={selectAll}
                                  onCheckedChange={(checked) => setSelectAll(checked as boolean)}
                                />
                              </TableHead>
                              <TableHead className="text-zinc-400">Thumbnail</TableHead>
                              <TableHead className="text-zinc-400">Title</TableHead>
                              <TableHead className="text-zinc-400">Category</TableHead>
                              <TableHead className="text-zinc-400">Quality</TableHead>
                              <TableHead className="text-zinc-400">Status</TableHead>
                              <TableHead className="text-zinc-400">Featured</TableHead>
                              <TableHead className="text-zinc-400">Downloads</TableHead>
                              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allScenepacks.map((sp) => (
                              <TableRow key={sp.id} className="ring-1 ring-white/5">
                                <TableCell>
                                  <Checkbox
                                    checked={selectedScenepacks.has(sp.id)}
                                    onCheckedChange={() => toggleSelection(sp.id)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="h-12 w-20 rounded bg-zinc-800 overflow-hidden">
                                    {sp.thumbnailUrl ? (
                                      <img 
                                        src={sp.thumbnailUrl} 
                                        alt={sp.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <FileVideo className="h-6 w-6 text-zinc-600" />
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <EditableTitle
                                    title={sp.title}
                                    id={sp.id}
                                    onSave={(newTitle) => handleTitleSave(sp.id, newTitle)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="ring-rose-600/30 text-rose-400">
                                    {sp.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    className={
                                      sp.quality === "4K" 
                                        ? "bg-purple-600 text-white" 
                                        : sp.quality === "FHD" 
                                          ? "bg-blue-600 text-white"
                                          : "bg-zinc-600 text-white"
                                    }
                                  >
                                    {sp.quality}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      sp.status === "approved"
                                        ? "bg-green-600 text-white"
                                        : sp.status === "rejected"
                                        ? "bg-red-600 text-white"
                                        : "bg-yellow-600 text-white"
                                    }
                                  >
                                    {sp.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <button
                                    onClick={() => handleFeatureToggle(sp.id, sp.featured)}
                                    className="p-1 rounded hover:bg-white/10 transition-colors"
                                  >
                                    <Star
                                      className={`h-5 w-5 ${
                                        sp.featured
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-zinc-500"
                                      }`}
                                    />
                                  </button>
                                </TableCell>
                                <TableCell className="text-zinc-300">{sp.downloads}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-zinc-400">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#0A0A0A] ring-1 ring-white/10">
                                      <DropdownMenuItem asChild>
                                        <Link href={`/scenepack/${sp.id}`} className="text-zinc-300 focus:text-rose-400 focus:bg-rose-600/10">
                                          <Eye className="h-4 w-4 mr-2" />
                                          View
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-zinc-300 focus:text-rose-400 focus:bg-rose-600/10"
                                        onClick={() => handleApprove(sp.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-white/5" />
                                      <DropdownMenuItem 
                                        className="text-red-500 focus:bg-rose-600/10"
                                        onClick={() => handleDelete(sp.id)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Manage Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="ring-1 ring-white/5">
                              <TableHead className="text-zinc-400">Avatar</TableHead>
                              <TableHead className="text-zinc-400">Name</TableHead>
                              <TableHead className="text-zinc-400">Email</TableHead>
                              <TableHead className="text-zinc-400">Role</TableHead>
                              <TableHead className="text-zinc-400">Banned</TableHead>
                              <TableHead className="text-zinc-400">Scenepacks</TableHead>
                              <TableHead className="text-zinc-400">Last Active</TableHead>
                              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allUsers.map((user) => (
                              <TableRow key={user.id} className={`ring-1 ring-white/5 ${user.banned ? "opacity-60" : ""}`}>
                                <TableCell>
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.image || undefined} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                                      {user.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell className="text-white font-medium">
                                  <Link href={`/profile/${user.id}`} className="hover:text-rose-400 transition-colors">
                                    {user.name || "N/A"}
                                  </Link>
                                </TableCell>
                                <TableCell className="text-zinc-300">{user.email}</TableCell>
                                <TableCell>
                                  <Select
                                    value={user.role}
                                    onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                                  >
                                    <SelectTrigger className="w-24 bg-transparent ring-1 ring-white/10">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0A0A0A] ring-1 ring-white/10">
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <button
                                    onClick={() => handleBanToggle(user.id, user.banned)}
                                    className={`p-1 rounded hover:bg-white/10 transition-colors ${
                                      user.banned ? "text-red-500" : "text-zinc-500"
                                    }`}
                                    title={user.banned ? "Click to unban" : "Click to ban"}
                                  >
                                    {user.banned ? (
                                      <ShieldOff className="h-5 w-5" />
                                    ) : (
                                      <Shield className="h-5 w-5" />
                                    )}
                                  </button>
                                </TableCell>
                                <TableCell>
                                  <Link href={`/profile/${user.id}`}>
                                    <Badge variant="outline" className="ring-rose-600/30 text-rose-400 cursor-pointer hover:bg-rose-600/10">
                                      {user.scenepackCount || 0} packs
                                    </Badge>
                                  </Link>
                                </TableCell>
                                <TableCell className="text-zinc-400">
                                  {user.lastActivity 
                                    ? new Date(user.lastActivity).toLocaleDateString()
                                    : "N/A"
                                  }
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-zinc-400">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#0A0A0A] ring-1 ring-white/10">
                                      <DropdownMenuItem asChild>
                                        <Link href={`/profile/${user.id}`} className="text-zinc-300 focus:text-rose-400 focus:bg-rose-600/10">
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          View Profile
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-white/5" />
                                      <DropdownMenuItem 
                                        className={user.banned ? "text-green-500 focus:bg-green-600/10" : "text-red-500 focus:bg-red-600/10"}
                                        onClick={() => handleBanToggle(user.id, user.banned)}
                                      >
                                        {user.banned ? (
                                          <>
                                            <Shield className="h-4 w-4 mr-2" />
                                            Unban User
                                          </>
                                        ) : (
                                          <>
                                            <ShieldOff className="h-4 w-4 mr-2" />
                                            Ban User
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {/* Top 10 Most Downloaded */}
                    <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Download className="h-5 w-5 text-rose-500" />
                          Top 10 Most Downloaded
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.topDownloaded || []} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                              <XAxis type="number" stroke="#71717a" />
                              <YAxis dataKey="title" type="category" stroke="#71717a" width={100} tick={{ fontSize: 10 }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="downloads" fill="#e11d48" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top 10 Most Viewed */}
                    <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Eye className="h-5 w-5 text-rose-500" />
                          Top 10 Most Viewed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.topViewed || []} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                              <XAxis type="number" stroke="#71717a" />
                              <YAxis dataKey="title" type="category" stroke="#71717a" width={100} tick={{ fontSize: 10 }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="views" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Downloads Over Time */}
                    <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-rose-500" />
                          Downloads Over Time (30 Days)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics?.downloadsOverTime || []}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                              <XAxis 
                                dataKey="date" 
                                stroke="#71717a" 
                                tick={{ fontSize: 10 }}
                                tickFormatter={(value) => value.split("-").slice(1).join("/")}
                              />
                              <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                              <Tooltip content={<LineTooltip />} />
                              <Line 
                                type="monotone" 
                                dataKey="downloads" 
                                stroke="#e11d48" 
                                strokeWidth={2}
                                dot={false}
                                name="Downloads"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* New Users Over Time */}
                    <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <UserPlus className="h-5 w-5 text-rose-500" />
                          New Users Over Time (30 Days)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics?.usersOverTime || []}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                              <XAxis 
                                dataKey="date" 
                                stroke="#71717a" 
                                tick={{ fontSize: 10 }}
                                tickFormatter={(value) => value.split("-").slice(1).join("/")}
                              />
                              <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                              <Tooltip content={<LineTooltip />} />
                              <Line 
                                type="monotone" 
                                dataKey="users" 
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                dot={false}
                                name="New Users"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-[#0A0A0A] ring-1 ring-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="h-5 w-5 text-rose-500" />
                        Platform Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Announcement Banner */}
                      <div className="py-4 ring-1 ring-white/5 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Megaphone className="h-5 w-5 text-rose-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-white font-medium">Announcement Banner</h4>
                            <p className="text-zinc-400 text-sm">Display a banner message on all pages</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Textarea
                            value={announcementBanner}
                            onChange={(e) => setAnnouncementBanner(e.target.value)}
                            placeholder="Enter announcement message..."
                            className="bg-transparent ring-1 ring-white/10 min-h-[80px]"
                          />
                          <Button
                            onClick={saveAnnouncementBanner}
                            className="bg-rose-600 hover:bg-rose-700 text-white self-end"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                        {settings?.announcementBanner && (
                          <div className="mt-4 p-3 bg-rose-600/10 ring-1 ring-rose-600/30 rounded-lg">
                            <p className="text-sm text-rose-400">Current banner: {settings.announcementBanner}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between py-4 ring-1 ring-white/5 rounded-lg px-4">
                        <div>
                          <h4 className="text-white font-medium">Require Approval</h4>
                          <p className="text-zinc-400 text-sm">New uploads need admin approval</p>
                        </div>
                        <Switch
                          checked={settings?.requireApproval ?? true}
                          onCheckedChange={(checked) => updateSetting("requireApproval", checked)}
                          disabled={settingsLoading}
                        />
                      </div>
                      <div className="flex items-center justify-between py-4 ring-1 ring-white/5 rounded-lg px-4">
                        <div>
                          <h4 className="text-white font-medium">Allow Mega Links</h4>
                          <p className="text-zinc-400 text-sm">Users can add Mega download links</p>
                        </div>
                        <Switch
                          checked={settings?.allowMegaLinks ?? true}
                          onCheckedChange={(checked) => updateSetting("allowMegaLinks", checked)}
                          disabled={settingsLoading}
                        />
                      </div>
                      <div className="flex items-center justify-between py-4 ring-1 ring-white/5 rounded-lg px-4">
                        <div>
                          <h4 className="text-white font-medium">Maintenance Mode</h4>
                          <p className="text-zinc-400 text-sm">Disable site for maintenance</p>
                        </div>
                        <Switch
                          checked={settings?.maintenanceMode ?? false}
                          onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                          disabled={settingsLoading}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
