"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
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
import { toast } from "sonner";

interface AdminStats {
  totalScenepacks: number;
  totalUsers: number;
  totalDownloads: number;
  totalViews: number;
  pendingApprovals: number;
}

interface PendingScenepack {
  id: string;
  title: string;
  category: string;
  quality: string;
  status: string;
  createdAt: string;
  uploader: { name: string; email: string };
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingScenepacks, setPendingScenepacks] = useState<PendingScenepack[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin");
    }
  }, [status, router]);

  // Fetch admin data only when authenticated as admin
  useEffect(() => {
    const fetchAdminData = async () => {
      if (status === "authenticated" && session?.user?.role === "admin") {
        try {
          const response = await fetch("/api/admin");
          if (!response.ok) throw new Error("Failed to fetch admin data");
          const data = await response.json();
          setStats(data.stats);
          setPendingScenepacks(data.pendingScenepacks || []);
          setRecentUsers(data.recentUsers || []);
        } catch (error) {
          console.error("Error fetching admin data:", error);
          toast.error("Failed to load admin data");
        } finally {
          setIsLoading(false);
        }
      } else if (status === "authenticated") {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [status, session]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) throw new Error("Failed to approve");
      toast.success("Scenepack approved!");
      setPendingScenepacks((prev) => prev.filter((sp) => sp.id !== id));
      if (stats) {
        setStats({ ...stats, pendingApprovals: stats.pendingApprovals - 1 });
      }
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
      setPendingScenepacks((prev) => prev.filter((sp) => sp.id !== id));
      if (stats) {
        setStats({ ...stats, pendingApprovals: stats.pendingApprovals - 1 });
      }
    } catch {
      toast.error("Failed to reject scenepack");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scenepack?")) return;
    try {
      const response = await fetch(`/api/scenepack/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Scenepack deleted");
      setPendingScenepacks((prev) => prev.filter((sp) => sp.id !== id));
    } catch {
      toast.error("Failed to delete scenepack");
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
                        {stats?.totalDownloads ? `${(stats.totalDownloads / 1000).toFixed(0)}K` : "0"}
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
                        {stats?.totalViews ? `${(stats.totalViews / 1000).toFixed(0)}K` : "0"}
                      </div>
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
                    {pendingScenepacks.length === 0 ? (
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
                            {pendingScenepacks.map((sp) => (
                              <TableRow key={sp.id} className="border-red-900/30">
                                <TableCell className="text-white font-medium">{sp.title}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-red-600/30 text-red-400 capitalize">
                                    {sp.category}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-300 hidden md:table-cell">{sp.uploader?.name || "Unknown"}</TableCell>
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
                    <CardTitle className="text-white">Manage Scenepacks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingScenepacks.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Package className="h-12 w-12 mx-auto mb-4" />
                        <p>No scenepacks to manage.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-red-900/30 hover:bg-transparent">
                              <TableHead className="text-gray-400">Title</TableHead>
                              <TableHead className="text-gray-400">Category</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-gray-400 hidden md:table-cell">Quality</TableHead>
                              <TableHead className="text-gray-400 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingScenepacks.map((sp) => (
                              <TableRow key={sp.id} className="border-red-900/30">
                                <TableCell className="text-white font-medium">{sp.title}</TableCell>
                                <TableCell className="capitalize text-gray-300">{sp.category}</TableCell>
                                <TableCell>
                                  <Badge className="bg-yellow-600 text-white">Pending</Badge>
                                </TableCell>
                                <TableCell className="text-gray-300 hidden md:table-cell">{sp.quality}</TableCell>
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
                                      <DropdownMenuItem 
                                        className="text-red-500 focus:bg-red-600/10"
                                        onClick={() => handleDelete(sp.id)}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card className="bg-gray-900/50 border-red-900/30">
                  <CardHeader>
                    <CardTitle className="text-white">Manage Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentUsers.length === 0 ? (
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
                              <TableHead className="text-gray-400 hidden md:table-cell">Joined</TableHead>
                              <TableHead className="text-gray-400 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentUsers.map((user) => (
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
                                      <DropdownMenuItem className="text-gray-300 focus:text-red-400 focus:bg-red-600/10">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Profile
                                      </DropdownMenuItem>
                                      {user.role !== "admin" && (
                                        <DropdownMenuItem className="text-gray-300 focus:text-red-400 focus:bg-red-600/10">
                                          Make Admin
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator className="bg-red-900/30" />
                                      <DropdownMenuItem className="text-red-500 focus:bg-red-600/10">
                                        Ban User
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
                      <Badge className="bg-green-600 text-white">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-red-900/30">
                      <div>
                        <h4 className="text-white font-medium">Allow Mega Links</h4>
                        <p className="text-gray-400 text-sm">Users can add Mega download links as alternative</p>
                      </div>
                      <Badge className="bg-green-600 text-white">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h4 className="text-white font-medium">Maintenance Mode</h4>
                        <p className="text-gray-400 text-sm">Temporarily disable the site for maintenance</p>
                      </div>
                      <Badge className="bg-gray-600 text-white">Disabled</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
