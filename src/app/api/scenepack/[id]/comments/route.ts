import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/scenepack/[id]/comments - Get paginated comments for a scenepack
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    // Check if scenepack exists
    const scenepack = await db.scenepack.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!scenepack) {
      return NextResponse.json(
        { error: "Scenepack not found" },
        { status: 404 }
      );
    }

    // Get total count for pagination
    const total = await db.comment.count({
      where: { scenepackId: id },
    });

    // Get comments with user info, newest first
    const comments = await db.comment.findMany({
      where: { scenepackId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          image: comment.user.image,
        },
      })),
      pagination: {
        page,
        totalPages,
        total,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/scenepack/[id]/comments - Create a new comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { error: "Comment must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Check if scenepack exists
    const scenepack = await db.scenepack.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!scenepack) {
      return NextResponse.json(
        { error: "Scenepack not found" },
        { status: 404 }
      );
    }

    // Create the comment
    const comment = await db.comment.create({
      data: {
        content: trimmedContent,
        userId: session.user.id,
        scenepackId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "comment",
        message: `Commented on "${scenepack.title}": "${trimmedContent.substring(0, 50)}${trimmedContent.length > 50 ? "..." : ""}"`,
        userId: session.user.id,
        targetId: id,
      },
    });

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        image: comment.user.image,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
