import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

    return NextResponse.json({
      ...scenepack,
      tags: scenepack.tags ? JSON.parse(scenepack.tags) : [],
      likes: scenepack.likes.length,
      saves: scenepack.saves.length,
      views: scenepack.views + 1,
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
    const body = await request.json();
    const { status, featured, title, description, category, quality, tags } = body;

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
    await db.scenepack.delete({
      where: { id },
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
