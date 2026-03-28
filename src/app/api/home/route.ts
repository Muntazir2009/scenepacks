import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get featured scenepacks (first one for video background)
    const featured = await db.scenepack.findMany({
      where: {
        status: "approved",
        featured: true,
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    // Get trending (most views) - top 6 for trending section
    const trending = await db.scenepack.findMany({
      where: { status: "approved" },
      take: 6,
      orderBy: { views: "desc" },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    // Get latest uploads
    const latest = await db.scenepack.findMany({
      where: { status: "approved" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    // Get stats
    const [totalScenepacks, totalDownloads, totalUsers] = await Promise.all([
      db.scenepack.count({ where: { status: "approved" } }),
      db.scenepack.aggregate({
        _sum: { downloads: true },
      }),
      db.user.count(),
    ]);

    // Get categories with counts
    const scenepacks = await db.scenepack.findMany({
      where: { status: "approved" },
      select: { category: true },
    });

    const categoryCounts = scenepacks.reduce(
      (acc, sp) => {
        const cat = sp.category.charAt(0).toUpperCase() + sp.category.slice(1);
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const formatScenepack = (sp: typeof featured[0]) => ({
      id: sp.id,
      title: sp.title,
      description: sp.description,
      category: sp.category.charAt(0).toUpperCase() + sp.category.slice(1),
      quality: sp.quality,
      tags: sp.tags ? JSON.parse(sp.tags) : [],
      views: sp.views,
      downloads: sp.downloads,
      thumbnailUrl: sp.thumbnailUrl,
      previewUrl: sp.previewUrl,
      featured: sp.featured,
      driveLink: sp.driveLink,
      megaLink: sp.megaLink,
      createdAt: sp.createdAt,
      createdBy: sp.createdBy,
    });

    const data = {
      featured: featured.map(formatScenepack),
      trending: trending.map(formatScenepack),
      latest: latest.map(formatScenepack),
      stats: {
        totalPacks: totalScenepacks,
        totalDownloads: totalDownloads._sum.downloads || 0,
        totalUsers: totalUsers,
        categoryCount: Object.keys(categoryCounts).length,
      },
      categories: categoryCounts,
    };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' }
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
