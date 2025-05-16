import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/app/api/admin-auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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
    const productIds = bestSellingProducts.map(item => item.productId);
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
    const bestSellers = bestSellingProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        quantity: item._sum.quantity || 0,
        price: product?.price || 0,
        image: product?.images && Array.isArray(product.images) && product.images.length > 0 
          ? product.images[0] 
          : null
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