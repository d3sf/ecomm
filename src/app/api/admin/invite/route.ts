import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import crypto from "crypto";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    // Validate role
    if (!["manager", "staff", "superadmin"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Create invite
    await prisma.adminInvite.create({
      data: {
        email,
        role: role.toUpperCase(),
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    // Send email
    const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/accept-invite?token=${token}`;
    
    await resend.emails.send({
      from: "Merugo <onboarding@resend.dev>",
      to: email,
      subject: "You are invited to Merugo Admin!",
      html: `
        <h1>Welcome to Merugo Admin!</h1>
        <p>You have been invited to join Merugo as an admin with the role of ${role}.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${acceptUrl}">Accept Invitation</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return NextResponse.json(
      { message: "Invitation sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin invite error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 