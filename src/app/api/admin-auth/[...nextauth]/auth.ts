import type { NextAuthOptions, User, Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface AdminUser extends User {
  type: "admin";
  role: string;
}

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter email and password");
          }

          const admin = await prisma.adminUser.findUnique({
            where: { email: credentials.email }
          });

          if (!admin) {
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: admin.id.toString(),
            email: admin.email,
            name: admin.name || undefined,
            type: "admin",
            role: admin.role
          } as AdminUser;
        } catch (error) {
          throw error;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
    error: "/admin/login"
  },
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      try {
        if (account?.provider === "google") {
          const existingAdmin = await prisma.adminUser.findUnique({
            where: { email: user.email! }
          });

          if (!existingAdmin) {
            const newAdmin = await prisma.adminUser.create({
              data: {
                email: user.email!,
                username: user.email!, // Using email as username
                name: user.name || "",
                passwordHash: "", // Empty password for Google auth
                role: "MANAGER" // Default role for Google sign-in
              }
            });
            user.id = newAdmin.id.toString();
          } else {
            user.id = existingAdmin.id.toString();
          }
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      if (user) {
        token.id = user.id;
        token.type = (user as AdminUser).type;
        token.role = (user as AdminUser).role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // Use token data directly instead of fetching from database on every session check
        session.user.id = token.id as string;
        session.user.type = token.type;
        session.user.role = token.role;
        session.user.name = session.user.name || undefined;
        session.user.email = session.user.email || undefined;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: false,
}; 