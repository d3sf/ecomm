import NextAuth from "next-auth";
import type { NextAuthOptions, User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

interface ShopUser extends User {
  type: "user";
  role: "customer";
  phone?: string;
}

export const shopAuthOptions: NextAuthOptions = {
  providers: [
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
        session.user.id = token.id as string;
        session.user.type = token.type as "user";
        session.user.role = token.role as "customer";
        session.user.phone = token.phone as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
};

const handler = NextAuth(shopAuthOptions);
export { handler as GET, handler as POST }; 