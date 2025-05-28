import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        verificationToken,
        emailVerified: false,
        phone: '', // Default empty string for phone
      },
    });

    // Send verification email
    await resend.emails.send({
      from: 'Merugo <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Welcome to Merugo!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}">
          Verify Email
        </a>
      `,
    });

    return NextResponse.json(
      { 
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 