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

    // TEMPORARY: Removing admin check to allow all authenticated users to access admin orders
    // TODO: Re-implement admin check later
    // const isAdmin = await prisma.adminUser.findUnique({
    //   where: { email: session.user.email },
    // });
    
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { error: "Forbidden" },
    //     { status: 403 }
    //   );
    // }

    // Get all orders with related data
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: {
          select: {
            fullName: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 