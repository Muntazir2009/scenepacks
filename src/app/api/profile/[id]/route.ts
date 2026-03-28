import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/profile/[id] - Get user profile with stats and paginated scenepacks
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const isOwnProfile = session?.user?.id === id;

    // Parse pagination params from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12; // 12 per page as specified
    const skip = (page - 1) * limit;

    // Get user info
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause based on whether viewing own profile
    const scenepackWhere = isOwnProfile
      ? { createdById: id }
      : { createdById: id, status: "approved" };

    // Get total count for pagination
    const totalScenepacks = await db.scenepack.count({
      where: scenepackWhere,
    });

    // Get paginated scenepacks
    const scenepacks = await db.scenepack.findMany({
      where: scenepackWhere,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        likes: true,
        saves: true,
        _count: {
          select: { comments: true },
        },
      },
    });

    // Calculate stats
    const totalUploads = await db.scenepack.count({
      where: { createdById: id },
    });

    // Get total downloads across all packs
    const downloadStats = await db.scenepack.aggregate({
      where: { createdById: id },
      _sum: {
        downloads: true,
      },
    });
    const totalDownloads = downloadStats._sum.downloads || 0;

    // Get total likes received (sum of likes on all their scenepacks)
    const likesStats = await db.like.count({
      where: {
        scenepack: {
          createdById: id,
        },
      },
    });
    const totalLikesReceived = likesStats;

    // Get comment count on user's scenepacks
    const commentCount = await db.comment.count({
      where: {
        scenepack: {
          createdById: id,
        },
      },
    });

    // Format scenepacks for response
    const formattedScenepacks = scenepacks.map((sp) => ({
      id: sp.id,
      title: sp.title,
      thumbnailUrl: sp.thumbnailUrl,
      previewUrl: sp.previewUrl,
      category: sp.category,
      quality: sp.quality,
      views: sp.views,
      downloads: sp.downloads,
      likes: sp.likes.length,
      saves: sp.saves.length,
      commentCount: sp._count.comments,
      status: sp.status,
      createdAt: sp.createdAt,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalScenepacks / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        role: user.role,
      },
      stats: {
        totalUploads,
        totalDownloads,
        totalLikesReceived,
        commentCount,
      },
      scenepacks: formattedScenepacks,
      isOwnProfile,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalScenepacks,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
