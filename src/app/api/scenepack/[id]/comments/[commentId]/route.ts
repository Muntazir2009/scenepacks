import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE /api/scenepack/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find the comment
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Verify the comment belongs to the specified scenepack
    if (comment.scenepackId !== id) {
      return NextResponse.json(
        { error: "Comment does not belong to this scenepack" },
        { status: 400 }
      );
    }

    // Check if user is the comment owner or an admin
    const isOwner = comment.userId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to delete this comment" },
        { status: 403 }
      );
    }

    // Delete the comment
    await db.comment.delete({
      where: { id: commentId },
    });

    // Log the deletion activity
    await db.activityLog.create({
      data: {
        action: "delete_comment",
        message: `Deleted a comment on scenepack`,
        userId: session.user.id,
        targetId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
