// Rate limiting: Consider adding rate limiting for production (e.g., 10 requests per minute)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const quality = searchParams.get("quality");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "latest";
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = parseInt(searchParams.get("offset") || "0");
  const featured = searchParams.get("featured");
  const timeframe = searchParams.get("timeframe") || "all";

  try {
    // Build date filter based on timeframe
    let dateFilter: Date | undefined;
    const now = new Date();
    
    if (timeframe === "today") {
      // Start of today (midnight)
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeframe === "week") {
      // 7 days ago
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    // "all" means no date filter

    const where: {
      status: string;
      category?: string;
      quality?: string;
      featured?: boolean;
      createdAt?: { gte: Date };
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
        tags?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      status: "approved",
    };

    if (category && category !== "all") {
      where.category = category.toLowerCase();
    }

    if (quality) {
      where.quality = quality;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (dateFilter) {
      where.createdAt = { gte: dateFilter };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, "desc" | "asc"> = { createdAt: "desc" };
    if (sort === "trending") {
      // For trending, we need to calculate a score
      // Score = views + (downloads * 2) + (likes * 3)
      // Since Prisma doesn't support computed columns in orderBy,
      // we'll fetch and sort in memory for trending
      orderBy = { views: "desc" };
    } else if (sort === "downloads") {
      orderBy = { downloads: "desc" };
    }

    const scenepacks = await db.scenepack.findMany({
      where,
      orderBy,
      take: sort === "trending" ? 100 : limit, // Fetch more for trending to sort by score
      skip: sort === "trending" ? 0 : offset,
      include: {
        likes: true,
        saves: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // For trending, sort by combined score
    if (sort === "trending") {
      const sortedPacks = scenepacks
        .map((sp) => ({
          ...sp,
          trendingScore: (sp.views || 0) + (sp.downloads || 0) * 2 + (sp.likes?.length || 0) * 3,
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(offset, offset + limit);
      
      const total = await db.scenepack.count({ where });
      
      const data = {
        scenepacks: sortedPacks.map((sp) => ({
          id: sp.id,
          title: sp.title,
          description: sp.description,
          thumbnailUrl: sp.thumbnailUrl,
          previewUrl: sp.previewUrl,
          driveLink: sp.driveLink,
          megaLink: sp.megaLink,
          category: sp.category,
          quality: sp.quality,
          tags: sp.tags ? JSON.parse(sp.tags) : [],
          status: sp.status,
          featured: sp.featured,
          views: sp.views,
          downloads: sp.downloads,
          createdAt: sp.createdAt,
          updatedAt: sp.updatedAt,
          createdById: sp.createdById,
          createdBy: sp.createdBy,
          likes: sp.likes.length,
          saves: sp.saves.length,
          trendingScore: sp.trendingScore,
        })),
        total,
        hasMore: offset + limit < total,
      };

      return NextResponse.json(data, {
        headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' }
      });
    }

    const total = await db.scenepack.count({ where });

    const data = {
      scenepacks: scenepacks.map((sp) => ({
        ...sp,
        tags: sp.tags ? JSON.parse(sp.tags) : [],
        likes: sp.likes.length,
        saves: sp.saves.length,
      })),
      total,
      hasMore: offset + limit < total,
    };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' }
    });
  } catch (error) {
    console.error("Error fetching scenepacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenepacks" },
      { status: 500 }
    );
  }
}

// TODO: Add rate limiting (e.g., 5 requests per minute for uploads)
export async function POST(request: Request) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      thumbnailUrl,
      previewUrl,
      category,
      quality,
      tags,
      driveLink,
      megaLink,
    } = body;

    // Validate required fields
    if (!title || !category || !driveLink) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, driveLink" },
        { status: 400 }
      );
    }

    // Create scenepack with pending status
    const scenepack = await db.scenepack.create({
      data: {
        title,
        description: description || null,
        thumbnailUrl: thumbnailUrl || null,
        previewUrl: previewUrl || null,
        category: category.toLowerCase(),
        quality: quality || "HD",
        tags: tags || "[]",
        driveLink,
        megaLink: megaLink || null,
        status: "pending",
        featured: false,
        views: 0,
        downloads: 0,
        createdById: session.user.id,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "upload",
        message: `New scenepack uploaded: "${title}"`,
        userId: session.user.id,
        targetId: scenepack.id,
      },
    });

    return NextResponse.json(scenepack);
  } catch (error) {
    console.error("Error creating scenepack:", error);
    return NextResponse.json(
      { error: "Failed to create scenepack" },
      { status: 500 }
    );
  }
}
