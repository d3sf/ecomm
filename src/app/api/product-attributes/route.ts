import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ GET: Fetch all attributes for a product
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const attributes = await prisma.productAttribute.findMany({
      where: { productId: Number(productId) },
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.error("Error fetching product attributes:", error);
    return NextResponse.json(
      { error: "Failed to fetch attributes" },
      { status: 500 }
    );
  }
}

// ✅ POST: Add attributes to a product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, name, value } = body;

    if (!productId || !name || !value) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const attribute = await prisma.productAttribute.create({
      data: {
        productId,
        name,
        value,
      },
    });

    return NextResponse.json(attribute, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating attribute:", error);
    return NextResponse.json(
      { error: "Failed to create attribute" },
      { status: 500 }
    );
  }
}
