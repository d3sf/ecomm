import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { shopAuthOptions } from "@/app/api/shop-auth/[...nextauth]/auth";
import { CartItem } from "@/types/cart";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(shopAuthOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { items, totalAmount, shippingAddressId, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingAddressId) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
    }
    
    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    }

    // Verify the shipping address belongs to the user
    const address = await prisma.address.findFirst({
      where: {
        id: shippingAddressId,
        userId: user.id
      }
    });

    if (!address) {
      return NextResponse.json({ error: "Invalid shipping address" }, { status: 400 });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: totalAmount,
        status: "PENDING",
        shippingAddressId: shippingAddressId,
        paymentMethod: paymentMethod,
        orderItems: {
          create: items.map((item: CartItem) => ({
            productId: parseInt(item.productId.toString(), 10),
            quantity: item.quantity,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
          }))
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[CHECKOUT_POST]", error);  
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 