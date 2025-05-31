import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { shopAuthOptions } from "@/app/api/shop-auth/[...nextauth]/auth";
import { Session } from "next-auth";

// Helper function to find user from session - reused from addresses/route.ts
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

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(shopAuthOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user using helper function
    const user = await findUserFromSession(session);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    const addressId = parseInt(id, 10);
    if (isNaN(addressId)) {
      return NextResponse.json({ error: "Invalid address ID" }, { status: 400 });
    }

    // Verify the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id
      }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const body = await req.json();
    const { 
      fullName, 
      phoneNumber, 
      addressLine1, 
      addressLine2, 
      city, 
      state, 
      postalCode, 
      isDefault,
      addressLabel,
      customLabel 
    } = body;

    // If this is set as default, unset all other default addresses
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: {
        id: addressId
      },
      data: {
        fullName,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        isDefault,
        addressLabel,
        customLabel: addressLabel === "OTHER" ? customLabel : null
      }
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
} 