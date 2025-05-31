import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/app/api/admin-auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const staff = await prisma.staff.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, password } = body;

    // Check if email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email },
    });

    if (existingStaff) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        role,
        passwordHash: hashedPassword,
        username: email,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error creating staff:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, role } = body;

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name,
        email,
        role,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error updating staff:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Staff ID is required", { status: 400 });
    }

    await prisma.staff.delete({
      where: { id: parseInt(id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 