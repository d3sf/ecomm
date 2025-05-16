import NextAuth from "next-auth";
import type { NextAuthOptions, User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

interface ShopUser extends User {
  type: "user";
  role: "customer";
  phone?: string;
}

export const shopAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "email-password",
      name: "Email Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter email and password");
          }

          const user = await prisma.user.findFirst({
            where: { email: credentials.email }
          });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in");
          }

          return {
            id: user.id.toString(),
            type: "user",
            role: "customer",
            phone: user.phone,
            name: user.name || undefined,
            email: user.email || undefined,
          } as ShopUser;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        id: { label: "User ID", type: "text" },
        phone: { label: "Phone", type: "text" },
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.phone) {
          return null;
        }

        try {
          // Verify the user exists in the database
          const user = await prisma.user.findFirst({
            where: { 
              id: parseInt(credentials.id),
              phone: credentials.phone 
            }
          });

          if (!user) {
            return null;
          }

          // Return the user data to be stored in the token
          return {
            id: user.id.toString(),
            type: "user",
            role: "customer",
            phone: user.phone,
            name: user.name || undefined,
            email: user.email || undefined,
          } as ShopUser;
        } catch (error) {
          console.error("Error authorizing user:", error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      if (user) {
        token.id = user.id;
        token.type = (user as ShopUser).type;
        token.role = (user as ShopUser).role;
        token.phone = (user as ShopUser).phone;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        try {
          // Always fetch the latest user data from the database
          if (token.id) {
            const user = await prisma.user.findUnique({
              where: { id: parseInt(token.id) },
              select: { 
                id: true, 
                name: true, 
                email: true,
                phone: true
              }
            });
            
            if (user) {
              session.user.id = user.id.toString();
              session.user.name = user.name || undefined;
              session.user.email = user.email || undefined;
              session.user.phone = user.phone || undefined;
              // Add type and role from token
              session.user.type = token.type as "user";
              session.user.role = token.role as "customer";
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to token data if database fetch fails
          session.user.id = token.id as string;
          session.user.type = token.type as "user";
          session.user.role = token.role as "customer";
          session.user.phone = token.phone as string;
        }
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(shopAuthOptions);
export { handler as GET, handler as POST }; 