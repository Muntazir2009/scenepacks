import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
          createdAt: true,
          updatedAt: true,
          image: true,
          _count: { select: { scenepacks: true } },
        },
      }),
      db.user.count({ where }),
    ]);

    // Get last activity for each user from ActivityLog
    const userIds = users.map(u => u.id);
    const recentActivities = await db.activityLog.findMany({
      where: {
        userId: { in: userIds },
      },
      orderBy: { createdAt: "desc" },
      select: {
        userId: true,
        createdAt: true,
      },
    });

    // Create a map of userId to last activity
    const lastActivityMap = new Map<string, Date>();
    for (const activity of recentActivities) {
      if (activity.userId && !lastActivityMap.has(activity.userId)) {
        lastActivityMap.set(activity.userId, activity.createdAt);
      }
    }

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        banned: user.banned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        image: user.image,
        scenepackCount: user._count.scenepacks,
        lastActivity: lastActivityMap.get(user.id)?.toISOString() || null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
