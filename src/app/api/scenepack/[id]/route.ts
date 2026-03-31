import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  try {
    const scenepack = await db.scenepack.findUnique({
      where: { id },
      include: {
        likes: true,
        saves: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!scenepack) {
      return NextResponse.json(
        { error: "Scenepack not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await db.scenepack.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Check if current user has liked/saved this scenepack
    let isLiked = false;
    let isSaved = false;

    if (session?.user?.id) {
      const userLike = await db.like.findUnique({
        where: {
          userId_scenepackId: {
            userId: session.user.id,
            scenepackId: id,
          },
        },
      });
      isLiked = !!userLike;

      const userSave = await db.save.findUnique({
        where: {
          userId_scenepackId: {
            userId: session.user.id,
            scenepackId: id,
          },
        },
      });
      isSaved = !!userSave;
    }

    return NextResponse.json({
      ...scenepack,
      tags: scenepack.tags ? JSON.parse(scenepack.tags) : [],
      likes: scenepack.likes.length,
      saves: scenepack.saves.length,
      views: scenepack.views + 1,
      isLiked,
      isSaved,
    });
  } catch (error) {
    console.error("Error fetching scenepack:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenepack" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { status, featured, title, description, category, quality, tags } = body;

    // Get the scenepack first to get its title for activity logging
    const existingScenepack = await db.scenepack.findUnique({
      where: { id },
      select: { title: true },
    });

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (quality) updateData.quality = quality;
    if (tags) updateData.tags = tags;

    const scenepack = await db.scenepack.update({
      where: { id },
      data: updateData,
    });

    // Log activity for status changes
    if (status && existingScenepack) {
      const action = status === "approved" ? "approve" : status === "rejected" ? "reject" : "update";
      const message = status === "approved" 
        ? `Approved scenepack: "${existingScenepack.title}"`
        : status === "rejected"
        ? `Rejected scenepack: "${existingScenepack.title}"`
        : `Updated scenepack: "${existingScenepack.title}"`;

      await db.activityLog.create({
        data: {
          action,
          message,
          userId: session?.user?.id || null,
          targetId: id,
        },
      });
    }

    return NextResponse.json(scenepack);
  } catch (error) {
    console.error("Error updating scenepack:", error);
    return NextResponse.json(
      { error: "Failed to update scenepack" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    
    // Require admin or owner to delete
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the scenepack first to check ownership
    const scenepack = await db.scenepack.findUnique({
      where: { id },
      select: { title: true, createdById: true, status: true },
    });

    if (!scenepack) {
      return NextResponse.json(
        { error: "Scenepack not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or owner
    const isAdmin = session.user.role === "admin";
    const isOwner = scenepack.createdById === session.user.id;
    
    // Owner can only delete pending packs, admin can delete any
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    if (isOwner && !isAdmin && scenepack.status !== "pending") {
      return NextResponse.json(
        { error: "Can only delete pending packs" },
        { status: 403 }
      );
    }

    await db.scenepack.delete({
      where: { id },
    });

    // Log the deletion activity
    await db.activityLog.create({
      data: {
        action: "delete",
        message: `Deleted scenepack: "${scenepack.title}"`,
        userId: session.user.id,
        targetId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scenepack:", error);
    return NextResponse.json(
      { error: "Failed to delete scenepack" },
      { status: 500 }
    );
  }
}
