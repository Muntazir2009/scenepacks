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
      OR?: Array<
        | { title: { contains: string } }
        | { createdBy: { OR: Array<{ name: { contains: string } } | { email: { contains: string } }> } }
      >;
    } = {};

    if (status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        {
          createdBy: {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
      ];
    }

    const [scenepacks, total] = await Promise.all([
      db.scenepack.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching scenepacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenepacks" },
      { status: 500 }
    );
  }
}
