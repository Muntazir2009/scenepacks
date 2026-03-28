import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get current session (optional - allow anonymous downloads)
    const session = await getServerSession(authOptions);

    // Increment download count
    const scenepack = await db.scenepack.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    // Log download to ActivityLog for analytics tracking
    await db.activityLog.create({
      data: {
        action: "download",
        message: `Downloaded scenepack: ${scenepack.title}`,
        userId: session?.user?.id || null,
        targetId: scenepack.id,
      },
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
