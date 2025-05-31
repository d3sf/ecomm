import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { shopAuthOptions } from "@/app/api/shop-auth/[...nextauth]/auth";
import Razorpay from "razorpay";
import { Prisma } from "@prisma/client";

// Initialize Razorpay with test keys
// In production, use environment variables for these keys
const razorpay = new Razorpay({
  key_id: "rzp_test_CATyXYNK2U1oRH", // Test key ID
  key_secret: "FH4jYMTZZYQabNpRkNRJt3Hy", // Test secret key
});

// Define the Razorpay response type
interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

// Define custom update data type for prisma
interface CustomOrderUpdateData {
  status?: string;
  paymentStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  razorpayPaymentData?: string;
}

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
    const { amount, currency = "INR", orderId } = body;

    if (!amount || !orderId) {
      return NextResponse.json({ error: "Amount and order ID are required" }, { status: 400 });
    }

    // Create a Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects amount in paise (1 INR = 100 paise)
      currency,
      receipt: `receipt_order_${orderId}`,
      payment_capture: true, // Auto-capture the payment
    }) as RazorpayOrderResponse;

    // Fetch order details from database
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { user: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order with Razorpay order ID
    // Using CustomOrderUpdateData to properly type the update
    const updateData: CustomOrderUpdateData = {
      razorpayOrderId: razorpayOrder.id,
      razorpayPaymentData: JSON.stringify(razorpayOrder)
    };
    
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: updateData as Prisma.OrderUpdateInput
    });

    // Set key_id explicitly
    const keyId = "rzp_test_CATyXYNK2U1oRH";

    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId,
      name: "Merugo",
      description: `Order #${orderId}`,
      orderId: orderId,
      prefillData: {
        name: user.name || "",
        email: user.email || "",
        contact: user.phone || "",
      }
    });
  } catch (error) {
    console.error("[RAZORPAY_ORDER_POST]", error);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}

// Handle Razorpay webhook/callback
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_payment_id, 
      razorpay_signature,
      orderId
    } = body;

    // Verify the payment details using Razorpay SDK (in production)
    // Here we're just assuming the payment is successful for the demo

    // Update the order status with custom fields
    const updateData: CustomOrderUpdateData = {
      status: "PAID",
      paymentStatus: "COMPLETED",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    };
    
    const updatedOrder = await prisma.order.update({
      where: { 
        id: parseInt(orderId) 
      },
      data: updateData as Prisma.OrderUpdateInput
    });

    return NextResponse.json({ 
      success: true, 
      message: "Payment successful", 
      order: updatedOrder 
    });
  } catch (error) {
    console.error("[RAZORPAY_VERIFY_PUT]", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
} 