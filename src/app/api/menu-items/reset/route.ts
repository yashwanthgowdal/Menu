import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { menuEvents } from "@/lib/events";

// POST /api/menu-items/reset — reset all struck-out items (admin only)
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.menuItem.updateMany({
      where: { isStruckOut: true },
      data: { isStruckOut: false },
    });

    menuEvents.emit({
      type: "reset_all",
      payload: { count: result.count },
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      restoredCount: result.count,
    });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: "Failed to reset items" }, { status: 500 });
  }
}
