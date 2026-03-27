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

    // Check if already saved
    const existingSave = await db.save.findUnique({
      where: {
        userId_scenepackId: {
          userId,
          scenepackId: id,
        },
      },
    });

    if (existingSave) {
      // Unsave
      await db.save.delete({
        where: { id: existingSave.id },
      });
      return NextResponse.json({ saved: false });
    } else {
      // Save
      await db.save.create({
        data: {
          userId,
          scenepackId: id,
        },
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("Error toggling save:", error);
    return NextResponse.json(
      { error: "Failed to toggle save" },
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
    const save = userId ? await db.save.findUnique({
      where: {
        userId_scenepackId: {
          userId,
          scenepackId: id,
        },
      },
    }) : null;

    const count = await db.save.count({
      where: { scenepackId: id },
    });

    return NextResponse.json({
      saved: !!save,
      count,
    });
  } catch (error) {
    console.error("Error checking save:", error);
    return NextResponse.json(
      { error: "Failed to check save status" },
      { status: 500 }
    );
  }
}
