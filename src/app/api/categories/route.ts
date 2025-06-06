import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { CategorySchema } from "@/lib/zodvalidation";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const getAll = searchParams.get('getAll') === 'true';
    
    if (getAll) {
      // Return all categories without pagination
      const categories = await prisma.category.findMany({
        where: {},
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
        include: {
          children: true,
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      // Transform the response to include productCount
      const categoriesWithCount = categories.map(category => ({
        ...category,
        productCount: category._count.products
      }));

      return NextResponse.json({
        categories: categoriesWithCount,
        totalCount: categories.length,
        page: 1,
        limit: categories.length,
      });
    }

    // Paginated response
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where: {},
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
        include: {
          children: true,
          _count: {
            select: {
              products: true
            }
          }
        },
        skip,
        take: limit,
      }),
      prisma.category.count(),
    ]);

    // Transform the response to include productCount
    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: category._count.products
    }));

    return NextResponse.json({
      categories: categoriesWithCount,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received Data:", body); // ✅ Debug incoming data

    // ✅ Validate using Zod
    const parsed = CategorySchema.safeParse(body);
    if (!parsed.success) {
      console.error("Zod Validation Error:", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, parentId, sortOrder, image } = parsed.data;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId ?? null,
        sortOrder: sortOrder ?? 0,
        image: image ?? Prisma.JsonNull, // Use Prisma.JsonNull instead of null
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
