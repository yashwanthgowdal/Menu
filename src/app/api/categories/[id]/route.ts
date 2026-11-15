import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { menuEvents } from "@/lib/events";

// PATCH /api/categories/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.name) data.slug = slugify(parsed.data.name);

    const category = await prisma.category.update({ where: { id }, data });

    menuEvents.emit({
      type: "category_updated",
      payload: { action: "updated", category },
      timestamp: Date.now(),
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category PATCH error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.category.delete({ where: { id } });

    menuEvents.emit({
      type: "category_updated",
      payload: { action: "deleted", id },
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
