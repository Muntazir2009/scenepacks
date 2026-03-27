import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get dashboard stats
    const [
      totalScenepacks,
      totalUsers,
      totalDownloads,
      totalViews,
      pendingApprovals,
      recentScenepacks,
      recentUsers,
      recentApprovedScenepacks,
      categoryStats,
    ] = await Promise.all([
      db.scenepack.count(),
      db.user.count(),
      db.scenepack.aggregate({ _sum: { downloads: true } }),
      db.scenepack.aggregate({ _sum: { views: true } }),
      db.scenepack.count({ where: { status: "pending" } }),
      db.scenepack.findMany({
        where: { status: "pending" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { name: true, email: true } },
        },
      }),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      // Get 5 most recent approved scenepacks
      db.scenepack.findMany({
        where: { status: "approved" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          createdBy: { select: { name: true } },
        },
      }),
      // Get scenepacks count by category
      db.scenepack.groupBy({
        by: ["category"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalScenepacks,
        totalUsers,
        totalDownloads: totalDownloads._sum.downloads || 0,
        totalViews: totalViews._sum.views || 0,
        pendingApprovals,
      },
      pendingScenepacks: recentScenepacks.map((sp) => ({
        id: sp.id,
        title: sp.title,
        category: sp.category,
        quality: sp.quality,
        status: sp.status,
        createdAt: sp.createdAt,
        uploader: sp.createdBy,
      })),
      recentUsers: recentUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
      recentApprovedScenepacks: recentApprovedScenepacks.map((sp) => ({
        id: sp.id,
        title: sp.title,
        createdAt: sp.createdAt,
        uploader: sp.createdBy.name || "Unknown",
      })),
      categoryStats: categoryStats.map((cat) => ({
        category: cat.category,
        count: cat._count.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
