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
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: {
      status?: string;
      OR?: Array<{ title: { contains: string; mode: "insensitive" } } | { createdBy: { OR: Array<{ name: { contains: string; mode: "insensitive" } } | { email: { contains: string; mode: "insensitive" } }> } }>;
    } = {};

    if (status !== "all") where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { createdBy: { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } },
      ];
    }

    const [scenepacks, total] = await Promise.all([
      db.scenepack.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      }),
      db.scenepack.count({ where }),
    ]);

    return NextResponse.json({
      scenepacks: scenepacks.map((sp) => ({
        id: sp.id,
        title: sp.title,
        category: sp.category,
        quality: sp.quality,
        status: sp.status,
        featured: sp.featured,
        views: sp.views,
        downloads: sp.downloads,
        createdAt: sp.createdAt,
        uploader: sp.createdBy,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch scenepacks" }, { status: 500 });
  }
}

// Bulk actions
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, ids } = body as { action: string; ids: string[] };

    if (!action || !ids || ids.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let result;

    switch (action) {
      case "approve":
        result = await db.scenepack.updateMany({
          where: { id: { in: ids } },
          data: { status: "approved" },
        });
        // Log activity
        await db.activityLog.create({
          data: {
            action: "bulk_approve",
            message: `Approved ${result.count} scenepack(s) in bulk`,
            userId: session.user?.id || null,
          },
        });
        break;

      case "reject":
        result = await db.scenepack.updateMany({
          where: { id: { in: ids } },
          data: { status: "rejected" },
        });
        // Log activity
        await db.activityLog.create({
          data: {
            action: "bulk_reject",
            message: `Rejected ${result.count} scenepack(s) in bulk`,
            userId: session.user?.id || null,
          },
        });
        break;

      case "delete":
        result = await db.scenepack.deleteMany({
          where: { id: { in: ids } },
        });
        // Log activity
        await db.activityLog.create({
          data: {
            action: "bulk_delete",
            message: `Deleted ${result.count} scenepack(s) in bulk`,
            userId: session.user?.id || null,
          },
        });
        break;

      case "approveAllPending":
        result = await db.scenepack.updateMany({
          where: { status: "pending" },
          data: { status: "approved" },
        });
        // Log activity
        await db.activityLog.create({
          data: {
            action: "approve_all_pending",
            message: `Approved all ${result.count} pending scenepack(s)`,
            userId: session.user?.id || null,
          },
        });
        break;

      case "featureRandom":
        // Get random approved scenepack that's not already featured
        const approvedPacks = await db.scenepack.findMany({
          where: { status: "approved", featured: false },
          select: { id: true, title: true },
        });
        if (approvedPacks.length > 0) {
          const randomPack = approvedPacks[Math.floor(Math.random() * approvedPacks.length)];
          // Unfeature all others first
          await db.scenepack.updateMany({
            where: { featured: true },
            data: { featured: false },
          });
          // Feature the random one
          await db.scenepack.update({
            where: { id: randomPack.id },
            data: { featured: true },
          });
          // Log activity
          await db.activityLog.create({
            data: {
              action: "feature_random",
              message: `Featured random scenepack: "${randomPack.title}"`,
              userId: session.user?.id || null,
              targetId: randomPack.id,
            },
          });
          result = { count: 1, featuredPack: randomPack };
        } else {
          result = { count: 0 };
        }
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
