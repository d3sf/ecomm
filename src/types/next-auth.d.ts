import "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string;
    name?: string;
    type: "user" | "admin";
    role: string;
    phone?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      type: "user" | "admin";
      role: string;
      phone?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id: string;
    type: "user" | "admin";
    role: string;
    phone?: string;
  }
}
