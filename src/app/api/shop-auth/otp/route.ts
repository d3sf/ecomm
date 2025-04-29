import { NextResponse } from "next/server";
import twilio from "twilio";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {
  try {
    const { phoneNumber, action, code, name, email } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (action === "send") {
      // Send OTP
      try {
        await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
          .verifications.create({ to: phoneNumber, channel: "sms" });

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json(
          { error: "Failed to send verification code. Please check your Twilio configuration." },
          { status: 500 }
        );
      }
    } else if (action === "verify") {
      if (!code) {
        return NextResponse.json(
          { error: "Verification code is required" },
          { status: 400 }
        );
      }

      // Verify OTP
      try {
        const verificationCheck = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
          .verificationChecks.create({ to: phoneNumber, code });

        if (verificationCheck.status === "approved") {
          // Find or create user
          let user = await prisma.user.findFirst({
            where: { phone: phoneNumber },
          });

          if (!user) {
            // Create new user with just phone number
            user = await prisma.user.create({
              data: {
                phone: phoneNumber,
                passwordHash: "", // Required field but not used
              },
            });
          }

          // If name and email are provided, update the user
          if (name || email) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                name: name || undefined,
                email: email || undefined,
              },
            });
          }

          // Return user data to the client for NextAuth signin
          return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              phone: user.phone,
              name: user.name,
              email: user.email,
              type: "user",
              role: "customer",
            },
          });
        } else {
          return NextResponse.json(
            { error: "Invalid verification code" },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json(
          { error: "Failed to verify code. Please check your Twilio configuration." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
} 