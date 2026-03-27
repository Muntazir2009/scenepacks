import { NextResponse } from "next/server";
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

  try {
    const where: {
      status: string;
      category?: string;
      quality?: string;
      featured?: boolean;
      OR?: Array<{
        title?: { contains: string };
        description?: { contains: string };
        tags?: { contains: string };
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

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    let orderBy: Record<string, "desc" | "asc"> = { createdAt: "desc" };
    if (sort === "trending") {
      orderBy = { views: "desc" };
    } else if (sort === "downloads") {
      orderBy = { downloads: "desc" };
    }

    const scenepacks = await db.scenepack.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
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

    const total = await db.scenepack.count({ where });

    return NextResponse.json({
      scenepacks: scenepacks.map((sp) => ({
        ...sp,
        tags: sp.tags ? JSON.parse(sp.tags) : [],
        likes: sp.likes.length,
        saves: sp.saves.length,
      })),
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching scenepacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenepacks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      userId,
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
        createdById: userId || "temp-user",
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
