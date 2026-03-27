"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  Download,
  Eye,
  FileVideo,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2,
  Shield,
  AlertCircle,
  TrendingUp,
  Star,
  StarOff,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
  createdAt: string;
  uploader: { id: string; name: string; email: string } | null;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
  image: string | null;
  scenepackCount: number;
}

interface PlatformSettings {
  id: string;
  requireApproval: boolean;
  allowMegaLinks: boolean;
  maintenanceMode: boolean;
}

interface CategoryStat {
  category: string;
  count: number;
}

interface RecentApproved {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  uploaderName: string | null;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Scenepacks state
  const [scenepacks, setScenepacks] = useState<Scenepack[]>([]);
  const [scenepacksPage, setScenepacksPage] = useState(1);
  const [scenepacksTotal, setScenepacksTotal] = useState(0);
  const [scenepacksStatus, setScenepacksStatus] = useState("all");
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [recentApproved, setRecentApproved] = useState<RecentApproved[]>([]);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersSearch, setUsersSearch] = useState("");

  // Settings state
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // User profile dialog
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserScenepacks, setSelectedUserScenepacks] = useState<
    Array<{ id: string; title: string; status: string; category: string; createdAt: string }>
  >([]);
  const [userProfileOpen, setUserProfileOpen] = useState(false);

  // Ban confirm dialog
  const [banConfirmOpen, setBanConfirmOpen] = useState(false);
  const [userToBan, setUserToBan] = useState<User | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin");
    }
  }, [status, router]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin");
      if (!response.ok) throw new Error("Failed to fetch admin data");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    }
  }, []);

  // Fetch scenepacks
  const fetchScenepacks = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: scenepacksPage.toString(),
        limit: "10",
        status: scenepacksStatus,
      });
      const response = await fetch(`/api/admin/scenepacks?${params}`);
      if (!response.ok) throw new Error("Failed to fetch scenepacks");
      const data = await response.json();
      setScenepacks(data.scenepacks);
      setScenepacksTotal(data.total);
      setCategoryStats(data.categoryStats);
      setRecentApproved(data.recentApproved);
    } catch (error) {
      console.error("Error fetching scenepacks:", error);
      toast.error("Failed to load scenepacks");
    }
  }, [scenepacksPage, scenepacksStatus]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        limit: "10",
        search: usersSearch,
      });
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
      setUsersTotal(data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  }, [usersPage, usersSearch]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([
          fetchDashboardStats(),
          fetchScenepacks(),
          fetchUsers(),
          fetchSettings(),
        ]);
        setIsLoading(false);
      };
      loadData();
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, session, fetchDashboardStats, fetchScenepacks, fetchUsers, fetchSettings]);

  // Refetch scenepacks when filters change
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchScenepacks();
    }
  }, [scenepacksPage, scenepacksStatus, status, session, fetchScenepacks]);

  // Refetch users when filters change
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchUsers();
    }
  }, [usersPage, usersSearch, status, session, fetchUsers]);

  // Scenepack actions
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) throw new Error("Failed to approve");
      toast.success("Scenepack approved!");
      fetchScenepacks();
      fetchDashboardStats();
    } catch {
      toast.error("Failed to approve scenepack");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (!response.ok) throw new Error("Failed to reject");
      toast.success("Scenepack rejected");
      fetchScenepacks();
      fetchDashboardStats();
    } catch {
      toast.error("Failed to reject scenepack");
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !featured }),
      });
      if (!response.ok) throw new Error("Failed to update featured");
      toast.success(featured ? "Removed from featured" : "Added to featured");
      fetchScenepacks();
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const handleDeleteScenepack = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scenepack? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Scenepack deleted");
      fetchScenepacks();
      fetchDashboardStats();
    } catch {
      toast.error("Failed to delete scenepack");
    }
  };

  // User actions
  const handleMakeAdmin = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }
      toast.success("User promoted to admin");
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  const handleBanUser = async (user: User) => {
    setUserToBan(user);
    setBanConfirmOpen(true);
  };

  const confirmBan = async () => {
    if (!userToBan) return;
    try {
      const response = await fetch(`/api/admin/users/${userToBan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: true }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to ban user");
      }
      toast.success("User has been banned");
      fetchUsers();
      setBanConfirmOpen(false);
      setUserToBan(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to ban user");
    }
  };

  const handleUnbanUser = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: false }),
      });
      if (!response.ok) throw new Error("Failed to unban");
      toast.success("User has been unbanned");
      fetchUsers();
    } catch {
      toast.error("Failed to unban user");
    }
  };

  const handleViewProfile = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch user profile");
      const data = await response.json();
      setSelectedUser(data);
      setSelectedUserScenepacks(data.scenepacks || []);
      setUserProfileOpen(true);
    } catch {
      toast.error("Failed to load user profile");
    }
  };

  // Settings actions
  const handleSettingChange = async (key: keyof PlatformSettings, value: boolean) => {
    setSettingsLoading(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!response.ok) throw new Error("Failed to update setting");
      const data = await response.json();
      setSettings(data);
      toast.success("Setting updated");
    } catch {
      toast.error("Failed to update setting");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="h-20 w-20 rounded-full bg-red-600/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
            <p className="text-gray-400 mb-6">
              Please sign in to access the admin panel.
            </p>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => router.push("/auth/login?callbackUrl=/admin")}
            >
              Sign In
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not admin
  if (session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="h-20 w-20 rounded-full bg-red-600/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              You don&apos;t have permission to access the admin panel. This area is restricted to administrators only.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                className="border-red-600/50 text-red-400"
                onClick={() => router.push("/")}
              >
                Go Home
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => router.push("/browse")}
              >
                Browse Scenepacks
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Admin loading data
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading admin dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const scenepackTotalPages = Math.ceil(scenepacksTotal / 10);
  const userTotalPages = Math.ceil(usersTotal / 10);

  // Admin dashboard
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-gray-400">
                    Welcome back, <span className="text-red-400">{session?.user?.name}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-gray-900/50 border border-red-900/30 h-auto flex-wrap gap-1 p-1">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 px-4"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="scenepacks"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 px-4"
                >
                  Scenepacks
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 px-4"
                >
                  Users
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 px-4"
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gray-900/50 border-red-900/30 hover:border-red-600/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm text-gray-400">Total Scenepacks</CardTitle>
                      <Package className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{stats?.totalScenepacks || 0}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-red-900/30 hover:border-red-600/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm text-gray-400">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-red-900/30 hover:border-red-600/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm text-gray-400">Total Downloads</CardTitle>
                      <Download className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {stats?.totalDownloads ? `${(stats.totalDownloads / 1000).toFixed(1)}K` : "0"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-red-900/30 hover:border-red-600/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm text-gray-400">Total Views</CardTitle>
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {stats?.totalViews ? `${(stats.totalViews / 1000).toFixed(1)}K` : "0"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Distribution Chart */}
                  <Card className="bg-gray-900/50 border-red-900/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileVideo className="h-5 w-5 text-red-500" />
                        Scenepacks by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoryStats.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          No data available
                        </div>
                      ) : (
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryStats}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis
                                dataKey="category"
                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1, 6)}
                              />
                              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid rgba(127, 29, 29, 0.3)",
                                  borderRadius: "8px",
                                }}
                                labelStyle={{ color: "#fff" }}
                              />
                              <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Approved */}
                  <Card className="bg-gray-900/50 border-red-900/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-red-500" />
                        Recent Approved Scenepacks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentApproved.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          No approved scenepacks yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentApproved.map((sp) => (
                            <div
                              key={sp.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                              <div>
                                <p className="text-white font-medium truncate max-w-[200px]">{sp.title}</p>
                                <p className="text-gray-400 text-sm">
                                  by {sp.uploaderName || "Unknown"} • {new Date(sp.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline" className="border-red-600/30 text-red-400 capitalize">
                                {sp.category}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Pending Approvals */}
                <Card className="bg-gray-900/50 border-red-900/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileVideo className="h-5 w-5 text-red-500" />
                      Pending Approvals
                      {stats?.pendingApprovals ? (
                        <Badge className="bg-yellow-600 text-white ml-2">
                          {stats.pendingApprovals}
                        </Badge>
                      ) : null}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scenepacks.filter((sp) => sp.status === "pending").length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>All caught up! No pending scenepacks to review.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-red-900/30 hover:bg-transparent">
                              <TableHead className="text-gray-400">Title</TableHead>
                              <TableHead className="text-gray-400">Category</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Uploader</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Uploaded</TableHead>
                              <TableHead className="text-gray-400 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scenepacks
                              .filter((sp) => sp.status === "pending")
                              .slice(0, 5)
                              .map((sp) => (
                                <TableRow key={sp.id} className="border-red-900/30">
                                  <TableCell className="text-white font-medium">{sp.title}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="border-red-600/30 text-red-400 capitalize">
                                      {sp.category}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-gray-300 hidden md:table-cell">
                                    {sp.uploader?.name || "Unknown"}
                                  </TableCell>
                                  <TableCell className="text-gray-400 hidden md:table-cell">
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
                                        className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                                        onClick={() => handleReject(sp.id)}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scenepacks Tab */}
              <TabsContent value="scenepacks" className="space-y-6">
                <Card className="bg-gray-900/50 border-red-900/30">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <CardTitle className="text-white">Manage Scenepacks</CardTitle>
                      <Select value={scenepacksStatus} onValueChange={setScenepacksStatus}>
                        <SelectTrigger className="w-[180px] bg-gray-800 border-red-900/30 text-white">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-red-900/30">
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {scenepacks.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Package className="h-12 w-12 mx-auto mb-4" />
                        <p>No scenepacks found.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-red-900/30 hover:bg-transparent">
                              <TableHead className="text-gray-400">Title</TableHead>
                              <TableHead className="text-gray-400">Category</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Quality</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Uploader</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Views</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Downloads</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Date</TableHead>
                              <TableHead className="text-gray-400 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scenepacks.map((sp) => (
                              <TableRow key={sp.id} className="border-red-900/30">
                                <TableCell className="text-white font-medium">
                                  <div className="flex items-center gap-2">
                                    {sp.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                    {sp.title}
                                  </div>
                                </TableCell>
                                <TableCell className="capitalize text-gray-300">{sp.category}</TableCell>
                                <TableCell className="text-gray-300 hidden md:table-cell">{sp.quality}</TableCell>
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
                                <TableCell className="text-gray-300 hidden md:table-cell">
                                  {sp.uploader?.name || "Unknown"}
                                </TableCell>
                                <TableCell className="text-gray-300 hidden md:table-cell">{sp.views}</TableCell>
                                <TableCell className="text-gray-300 hidden md:table-cell">{sp.downloads}</TableCell>
                                <TableCell className="text-gray-400 hidden md:table-cell">
                                  {new Date(sp.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-gray-900 border-red-900/30">
                                      {sp.status === "pending" && (
                                        <>
                                          <DropdownMenuItem
                                            className="text-gray-300 focus:text-green-400 focus:bg-green-600/10"
                                            onClick={() => handleApprove(sp.id)}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-gray-300 focus:text-red-400 focus:bg-red-600/10"
                                            onClick={() => handleReject(sp.id)}
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="bg-red-900/30" />
                                        </>
                                      )}
                                      <DropdownMenuItem
                                        className="text-gray-300 focus:text-yellow-400 focus:bg-yellow-600/10"
                                        onClick={() => handleToggleFeatured(sp.id, sp.featured)}
                                      >
                                        {sp.featured ? (
                                          <>
                                            <StarOff className="h-4 w-4 mr-2" />
                                            Remove Featured
                                          </>
                                        ) : (
                                          <>
                                            <Star className="h-4 w-4 mr-2" />
                                            Make Featured
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-red-900/30" />
                                      <DropdownMenuItem
                                        className="text-red-500 focus:bg-red-600/10"
                                        onClick={() => handleDeleteScenepack(sp.id)}
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
                    )}
                    {/* Pagination */}
                    {scenepackTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-red-900/30">
                        <p className="text-gray-400 text-sm">
                          Page {scenepacksPage} of {scenepackTotalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-900/30 text-red-400"
                            disabled={scenepacksPage === 1}
                            onClick={() => setScenepacksPage((p) => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-900/30 text-red-400"
                            disabled={scenepacksPage === scenepackTotalPages}
                            onClick={() => setScenepacksPage((p) => p + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card className="bg-gray-900/50 border-red-900/30">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <CardTitle className="text-white">Manage Users</CardTitle>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name or email..."
                          value={usersSearch}
                          onChange={(e) => {
                            setUsersSearch(e.target.value);
                            setUsersPage(1);
                          }}
                          className="pl-10 w-[250px] bg-gray-800 border-red-900/30 text-white placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {users.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Users className="h-12 w-12 mx-auto mb-4" />
                        <p>No users found.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-red-900/30 hover:bg-transparent">
                              <TableHead className="text-gray-400">Name</TableHead>
                              <TableHead className="text-gray-400">Email</TableHead>
                              <TableHead className="text-gray-400">Role</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Scenepacks</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Joined</TableHead>
                              <TableHead className="text-gray-400 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id} className="border-red-900/30">
                                <TableCell className="text-white font-medium">{user.name || "N/A"}</TableCell>
                                <TableCell className="text-gray-300">{user.email}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      user.role === "admin"
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-700 text-gray-300"
                                    }
                                  >
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {user.banned ? (
                                    <Badge className="bg-red-600 text-white">Banned</Badge>
                                  ) : (
                                    <Badge className="bg-green-600 text-white">Active</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-gray-300 hidden md:table-cell">
                                  {user.scenepackCount}
                                </TableCell>
                                <TableCell className="text-gray-400 hidden md:table-cell">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-gray-900 border-red-900/30">
                                      <DropdownMenuItem
                                        className="text-gray-300 focus:text-red-400 focus:bg-red-600/10"
                                        onClick={() => handleViewProfile(user)}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Profile
                                      </DropdownMenuItem>
                                      {user.role !== "admin" && (
                                        <DropdownMenuItem
                                          className="text-gray-300 focus:text-yellow-400 focus:bg-yellow-600/10"
                                          onClick={() => handleMakeAdmin(user.id)}
                                        >
                                          <Shield className="h-4 w-4 mr-2" />
                                          Make Admin
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator className="bg-red-900/30" />
                                      {user.banned ? (
                                        <DropdownMenuItem
                                          className="text-green-500 focus:bg-green-600/10"
                                          onClick={() => handleUnbanUser(user.id)}
                                        >
                                          <UserCheck className="h-4 w-4 mr-2" />
                                          Unban User
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          className="text-red-500 focus:bg-red-600/10"
                                          onClick={() => handleBanUser(user)}
                                        >
                                          <UserX className="h-4 w-4 mr-2" />
                                          Ban User
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {/* Pagination */}
                    {userTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-red-900/30">
                        <p className="text-gray-400 text-sm">
                          Page {usersPage} of {userTotalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-900/30 text-red-400"
                            disabled={usersPage === 1}
                            onClick={() => setUsersPage((p) => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-900/30 text-red-400"
                            disabled={usersPage === userTotalPages}
                            onClick={() => setUsersPage((p) => p + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-gray-900/50 border-red-900/30">
                  <CardHeader>
                    <CardTitle className="text-white">Platform Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-4 border-b border-red-900/30">
                      <div>
                        <h4 className="text-white font-medium">Require Approval</h4>
                        <p className="text-gray-400 text-sm">New uploads need admin approval before going live</p>
                      </div>
                      <Switch
                        checked={settings?.requireApproval ?? true}
                        disabled={settingsLoading}
                        onCheckedChange={(checked) => handleSettingChange("requireApproval", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-red-900/30">
                      <div>
                        <h4 className="text-white font-medium">Allow Mega Links</h4>
                        <p className="text-gray-400 text-sm">Users can add Mega download links as alternative</p>
                      </div>
                      <Switch
                        checked={settings?.allowMegaLinks ?? true}
                        disabled={settingsLoading}
                        onCheckedChange={(checked) => handleSettingChange("allowMegaLinks", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h4 className="text-white font-medium">Maintenance Mode</h4>
                        <p className="text-gray-400 text-sm">Temporarily disable the site for maintenance</p>
                      </div>
                      <Switch
                        checked={settings?.maintenanceMode ?? false}
                        disabled={settingsLoading}
                        onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* User Profile Dialog */}
      <Dialog open={userProfileOpen} onOpenChange={setUserProfileOpen}>
        <DialogContent className="bg-gray-900 border-red-900/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">User Profile</DialogTitle>
            <DialogDescription className="text-gray-400">
              View user details and scenepacks
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white font-medium">{selectedUser.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-medium truncate">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Role</p>
                  <Badge
                    className={
                      selectedUser.role === "admin"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Joined</p>
                  <p className="text-white font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Scenepacks</p>
                  <p className="text-white font-medium">{selectedUser.scenepackCount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  {selectedUser.banned ? (
                    <Badge className="bg-red-600 text-white">Banned</Badge>
                  ) : (
                    <Badge className="bg-green-600 text-white">Active</Badge>
                  )}
                </div>
              </div>
              {selectedUserScenepacks.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Recent Scenepacks</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedUserScenepacks.map((sp) => (
                      <div
                        key={sp.id}
                        className="flex items-center justify-between p-2 rounded bg-gray-800/50"
                      >
                        <span className="text-white text-sm truncate max-w-[150px]">{sp.title}</span>
                        <Badge
                          className={
                            sp.status === "approved"
                              ? "bg-green-600 text-white text-xs"
                              : sp.status === "rejected"
                              ? "bg-red-600 text-white text-xs"
                              : "bg-yellow-600 text-white text-xs"
                          }
                        >
                          {sp.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="border-red-600/50 text-red-400"
              onClick={() => setUserProfileOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Confirm Dialog */}
      <Dialog open={banConfirmOpen} onOpenChange={setBanConfirmOpen}>
        <DialogContent className="bg-gray-900 border-red-900/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Ban</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to ban this user?
            </DialogDescription>
          </DialogHeader>
          {userToBan && (
            <div className="py-4">
              <p className="text-gray-300">
                You are about to ban <span className="text-white font-medium">{userToBan.name || userToBan.email}</span>.
                This will prevent them from logging in and accessing the platform.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-red-600/50 text-red-400"
              onClick={() => {
                setBanConfirmOpen(false);
                setUserToBan(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmBan}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
