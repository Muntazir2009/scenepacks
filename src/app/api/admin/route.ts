import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get dashboard stats
    const [
      totalScenepacks,
      totalUsers,
      totalDownloads,
      totalViews,
      pendingApprovals,
      recentScenepacks,
      recentUsers,
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
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
