import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = parseInt(searchParams.get("categoryId") || "0");
  const currentProductId = parseInt(searchParams.get("currentProductId") || "0");
  const limit = parseInt(searchParams.get("limit") || "6");

  if (!categoryId || !currentProductId) {
    return NextResponse.json(
      { error: "Category ID and current product ID are required" },
      { status: 400 }
    );
  }

  try {
    // Fetch products from the same category, excluding the current product
    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { defaultCategoryId: categoryId },
              { categories: { some: { categoryId: categoryId } } }
            ]
          },
          { id: { not: currentProductId } },
          { published: true }
        ]
      },
      include: {
        categories: {
          select: {
            category: true
          }
        },
        defaultCategory: true,
        attributes: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
} 