import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { shopAuthOptions } from "@/app/api/shop-auth/[...nextauth]/auth";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || ""
});

// POST - Create a Razorpay order
export async function POST(request: Request) {
  try {
    const session = await getServerSession(shopAuthOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Get user details for prefill
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: order.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Merugo Store",
      description: "Purchase from Merugo Store",
      prefillData: {
        name: user.name || "",
        email: user.email || "",
        contact: user.phone || "",
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}

// PUT - Verify Razorpay payment and update order
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(shopAuthOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      orderId: orderIdString,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await request.json();

    const orderId = Number(orderIdString);

    if (isNaN(orderId) || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification details" },
        { status: 400 }
      );
    }

    // Verify signature
    const signBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(signBody.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update order with payment details
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
} 