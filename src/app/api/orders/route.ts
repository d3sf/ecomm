import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { shopAuthOptions } from "@/app/api/shop-auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";

// Helper function to find user from session
async function findUserFromSession(session: Session | null) {
  if (!session?.user) return null;
  
  // Try finding by ID first
  if (session.user.id) {
    try {
      const userId = parseInt(session.user.id);
      if (!isNaN(userId)) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) return user;
      }
    } catch (e) {
      console.error("Error finding user by ID:", e);
    }
  }

  // Try finding by phone if available
  if (session.user.phone) {
    try {
      const user = await prisma.user.findFirst({ where: { phone: session.user.phone } });
      if (user) return user;
    } catch (e) {
      console.error("Error finding user by phone:", e);
    }
  }

  // Try finding by email if available
  if (session.user.email) {
    try {
      const user = await prisma.user.findFirst({ where: { email: session.user.email } });
      if (user) return user;
    } catch (e) {
      console.error("Error finding user by email:", e);
    }
  }

  return null;
}

export async function GET() {
  try {
    const session = await getServerSession(shopAuthOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find user using helper function
    const user = await findUserFromSession(session);
    if (!user) {
      return NextResponse.json([]);
    }

    // Get the user's orders with related data
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
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