import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Return 401 if not authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return 403 if not admin
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // 1. Top 10 most downloaded scenepacks
    const topDownloaded = await db.scenepack.findMany({
      where: { status: "approved" },
      orderBy: { downloads: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        downloads: true,
        thumbnailUrl: true,
      },
    });

    // 2. Top 10 most viewed scenepacks
    const topViewed = await db.scenepack.findMany({
      where: { status: "approved" },
      orderBy: { views: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        views: true,
        thumbnailUrl: true,
      },
    });

    // 3. New users per day for last 30 days using PostgreSQL DATE_TRUNC
    const usersPerDayRaw = await db.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*) as count
      FROM users
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `;

    // Format users per day data
    const usersPerDay = usersPerDayRaw.map((item) => ({
      date: item.date.toISOString().split("T")[0],
      count: Number(item.count),
    }));

    // 4. Downloads per day for last 30 days - using ActivityLog
    // Query download events from ActivityLog
    const downloadsPerDayRaw = await db.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*) as count
      FROM activity_logs
      WHERE action = 'download'
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `;

    // Format downloads per day data
    const downloadsPerDay = downloadsPerDayRaw.map((item) => ({
      date: item.date.toISOString().split("T")[0],
      count: Number(item.count),
    }));

    // 5. Summary stats
    const [
      totalUsersResult,
      totalScenepacksResult,
      totalDownloadsResult,
      pendingApprovalsResult,
    ] = await Promise.all([
      // Total users count
      db.user.count(),
      // Total scenepacks count (approved)
      db.scenepack.count({ where: { status: "approved" } }),
      // Total downloads (sum of all scenepack downloads)
      db.scenepack.aggregate({
        _sum: { downloads: true },
      }),
      // Pending approvals count
      db.scenepack.count({ where: { status: "pending" } }),
    ]);

    const summary = {
      totalUsers: totalUsersResult,
      totalScenepacks: totalScenepacksResult,
      totalDownloads: totalDownloadsResult._sum.downloads || 0,
      pendingApprovals: pendingApprovalsResult,
    };

    return NextResponse.json({
      topDownloaded,
      topViewed,
      usersPerDay,
      downloadsPerDay,
      summary,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
