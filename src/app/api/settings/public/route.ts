import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let settings = await db.platformSettings.findFirst();
    
    if (!settings) {
      settings = await db.platformSettings.create({
        data: {
          requireApproval: true,
          allowMegaLinks: true,
          maintenanceMode: false,
        },
      });
    }
    
    // Only return announcement banner (public field)
    return NextResponse.json({
      announcementBanner: settings.announcementBanner,
    }, {
      headers: { 'Cache-Control': 's-maxage=60' }
    });
  } catch {
    return NextResponse.json({ announcementBanner: null });
  }
}
