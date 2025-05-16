import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Fetch products by their IDs (for cart and checkout)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productIds } = body;
    
    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Product IDs are required" },
        { status: 400 }
      );
    }

    // Format IDs to handle both string and number types
    const formattedIds = productIds.map(id => {
      const numId = Number(id);
      return isNaN(numId) ? null : numId;
    }).filter((id): id is number => id !== null);

    if (formattedIds.length === 0) {
      return NextResponse.json(
        { error: "No valid product IDs provided" },
        { status: 400 }
      );
    }

    // Fetch only the requested products by ID
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: formattedIds
        }
      },
      include: {
        categories: {
          select: {
            category: true
          }
        },
        defaultCategory: true,
        attributes: true
      }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching cart products:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart products" },
      { status: 500 }
    );
  }
} 