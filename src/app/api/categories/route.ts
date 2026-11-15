import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { menuEvents } from "@/lib/events";

// GET /api/categories — public
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories — admin only
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const slug = slugify(parsed.data.name);
    const category = await prisma.category.create({
      data: { name: parsed.data.name, slug, sortOrder: parsed.data.sortOrder },
    });

    menuEvents.emit({
      type: "category_updated",
      payload: { action: "created", category },
      timestamp: Date.now(),
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Category POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
