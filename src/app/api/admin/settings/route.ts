import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let settings = await db.platformSettings.findFirst();
    if (!settings) {
      settings = await db.platformSettings.create({
        data: { requireApproval: true, allowMegaLinks: true, maintenanceMode: false },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { requireApproval, allowMegaLinks, maintenanceMode, announcementBanner } = body;

    // First, ensure settings exist
    let settings = await db.platformSettings.findFirst();

    if (!settings) {
      // Create new settings
      settings = await db.platformSettings.create({
        data: {
          requireApproval: requireApproval ?? true,
          allowMegaLinks: allowMegaLinks ?? true,
          maintenanceMode: maintenanceMode ?? false,
          announcementBanner: announcementBanner ?? null,
        },
      });
    } else {
      // Update existing settings
      const updateData: {
        requireApproval?: boolean;
        allowMegaLinks?: boolean;
        maintenanceMode?: boolean;
        announcementBanner?: string | null;
      } = {};
      
      if (requireApproval !== undefined) updateData.requireApproval = requireApproval;
      if (allowMegaLinks !== undefined) updateData.allowMegaLinks = allowMegaLinks;
      if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
      if (announcementBanner !== undefined) updateData.announcementBanner = announcementBanner || null;

      settings = await db.platformSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    // Log activity for announcement changes
    if (announcementBanner !== undefined) {
      try {
        await db.activityLog.create({
          data: {
            action: "settings_update",
            message: announcementBanner
              ? `Updated announcement banner`
              : "Cleared announcement banner",
            userId: session.user?.id || null,
          },
        });
      } catch (logError) {
        console.error("Failed to log activity:", logError);
        // Don't fail the request if logging fails
      }
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
