import NextAuth from "next-auth";
import type { NextAuthOptions, User, Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface ShopUser extends User {
  type: "user";
  role: "customer";
}

export const shopAuthOptions: NextAuthOptions = {
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
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const user = await prisma.user.findUnique({
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

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name || undefined,
          type: "user",
          role: "customer"
        } as ShopUser;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || "",
              passwordHash: "" // Empty password for Google auth
            }
          });
          user.id = newUser.id.toString();
          user.type = "user";
          user.role = "customer";
        } else {
          user.id = existingUser.id.toString();
          user.type = "user";
          user.role = "customer";
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: JWT; user: User | undefined; account: Account | null }) {
      if (user) {
        token.id = user.id;
        token.type = (user as ShopUser).type;
        token.role = (user as ShopUser).role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.type = token.type as "user";
        session.user.role = token.role as "customer";
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