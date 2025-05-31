import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/app/api/admin-auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";

type OrderWhereInput = {
  OR?: Array<{
    id?: number;
    user?: {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    };
  }>;
};

export async function GET(request: Request) {
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

    // Get search term and pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause: OrderWhereInput = searchTerm ? {
      OR: [
        { id: isNaN(Number(searchTerm)) ? undefined : Number(searchTerm) },
        {
          user: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } }
            ]
          }
        }
      ]
    } : {};

    // Get orders with pagination and total count
    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
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
        skip,
        take: limit,
      }),
      prisma.order.count({ where: whereClause })
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 