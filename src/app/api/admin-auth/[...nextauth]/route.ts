import NextAuth from "next-auth";
import { adminAuthOptions } from "./auth";

const handler = NextAuth(adminAuthOptions);

export const GET = handler;
export const POST = handler; 