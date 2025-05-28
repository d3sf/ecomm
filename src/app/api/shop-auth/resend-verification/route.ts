import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = uuidv4();

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
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
      { message: 'Verification email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
} 