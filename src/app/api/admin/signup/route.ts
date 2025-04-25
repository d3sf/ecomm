import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.adminUser.create({
      data: {
        name,
        email,
        username: email, // Using email as username since it's required
        passwordHash: hashedPassword,
        role: 'MANAGER' // Default role
      }
    });

    return NextResponse.json(
      { message: "Admin created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 