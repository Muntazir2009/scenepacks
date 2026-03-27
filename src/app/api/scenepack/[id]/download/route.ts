import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Increment download count
    const scenepack = await db.scenepack.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    return NextResponse.json({
      downloads: scenepack.downloads,
    });
  } catch (error) {
    console.error("Error incrementing download:", error);
    return NextResponse.json(
      { error: "Failed to increment download count" },
      { status: 500 }
    );
  }
}
