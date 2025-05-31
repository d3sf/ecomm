import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/app/api/admin-auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const personalInfoSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email format").optional(),
});

const securitySchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(adminAuthOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Check if this is a password update request
        if (body.currentPassword && body.newPassword) {
            const validatedData = securitySchema.parse(body);

            const user = await prisma.adminUser.findUnique({
                where: { id: parseInt(session.user.id) },
                select: { passwordHash: true },
            });

            if (!user?.passwordHash) {
                return NextResponse.json(
                    { message: "User not found" },
                    { status: 404 }
                );
            }

            const isValidPassword = await bcrypt.compare(
                validatedData.currentPassword,
                user.passwordHash
            );

            if (!isValidPassword) {
                return NextResponse.json(
                    { message: "Current password is incorrect" },
                    { status: 400 }
                );
            }

            const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
            await prisma.adminUser.update({
                where: { id: parseInt(session.user.id) },
                data: { passwordHash: hashedPassword },
            });

            return NextResponse.json(
                { message: "Password updated successfully" },
                { status: 200 }
            );
        }

        // Handle personal info update
        const validatedData = personalInfoSchema.parse(body);

        if (validatedData.name || validatedData.email) {
            await prisma.adminUser.update({
                where: { id: parseInt(session.user.id) },
                data: {
                    ...(validatedData.name && { name: validatedData.name }),
                    ...(validatedData.email && { email: validatedData.email }),
                },
            });
        }

        return NextResponse.json(
            { message: "Profile updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }
        
        console.error("Profile update error:", error);
        return NextResponse.json(
            { message: "Failed to update profile" },
            { status: 500 }
        );
    }
} 