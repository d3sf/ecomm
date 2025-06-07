import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/app/api/admin-auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface BestSellingProduct {
  productId: number;
  _sum: {
    quantity: number | null;
  };
}

interface ProductWithImages {
  id: number;
  name: string;
  price: number;
  images: { url: string; publicId: string }[] | null;
}

export async function GET() {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Count total orders
    const totalOrders = await prisma.order.count();

    // Count orders by status
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" }
    });

    const processingOrders = await prisma.order.count({
      where: { status: "PROCESSING" }
    });

    const deliveredOrders = await prisma.order.count({
      where: { status: "DELIVERED" }
    });

    // Get best-selling products
    const bestSellingProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Get product details for the best-selling products
    const productIds = bestSellingProducts.map((item: BestSellingProduct) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true
      }
    });

    // Combine product details with sales data
    const bestSellers = bestSellingProducts.map((item: BestSellingProduct) => {
      const product = products.find((p) => p.id === item.productId) as ProductWithImages | undefined;
      const images = product?.images as { url: string; publicId: string }[] | null;
      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        quantity: item._sum.quantity || 0,
        price: product?.price || 0,
        image: images && images.length > 0 ? images[0].url : null
      };
    });

    // Return order statistics and best sellers
    return NextResponse.json({
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      bestSellingProducts: bestSellers
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
} 