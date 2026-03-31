import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    // Check if already liked
    const existingLike = await db.like.findUnique({
      where: {
        userId_scenepackId: {
          userId,
          scenepackId: id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await db.like.create({
        data: {
          userId,
          scenepackId: id,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    let like: { id: string } | null = null;
    if (userId) {
      like = await db.like.findUnique({
        where: {
          userId_scenepackId: {
            userId,
            scenepackId: id,
          },
        },
        select: { id: true },
      });
    }

    const count = await db.like.count({
      where: { scenepackId: id },
    });

    return NextResponse.json({
      liked: !!like,
      count,
    });
  } catch (error) {
    console.error("Error checking like:", error);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 }
    );
  }
}
