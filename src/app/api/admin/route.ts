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
      allScenepacks,
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
      db.scenepack.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          quality: true,
          status: true,
          featured: true,
          views: true,
          downloads: true,
          thumbnailUrl: true,
          createdAt: true,
          createdBy: { select: { name: true, email: true } },
        },
      }),
    ]);

    // Get signups per day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const usersLast30Days = await db.user.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    });

    // Group users by day
    const signupsPerDay: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = usersLast30Days.filter((u) => {
        const userDate = new Date(u.createdAt).toISOString().split("T")[0];
        return userDate === dateStr;
      }).length;
      signupsPerDay.push({
        date: dateStr,
        count,
      });
    }

    // Get category distribution
    const categories = await db.scenepack.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { status: "approved" },
    });

    const categoryDistribution = categories.map((cat) => ({
      name: cat.category,
      value: cat._count.id,
    }));

    // Get newest user
    const newestUser = await db.user.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

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
      allScenepacks: allScenepacks.map((sp) => ({
        id: sp.id,
        title: sp.title,
        category: sp.category,
        quality: sp.quality,
        status: sp.status,
        featured: sp.featured,
        views: sp.views,
        downloads: sp.downloads,
        thumbnailUrl: sp.thumbnailUrl,
        createdAt: sp.createdAt,
        uploader: sp.createdBy,
      })),
      signupsPerDay,
      categoryDistribution,
      newestUser,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
