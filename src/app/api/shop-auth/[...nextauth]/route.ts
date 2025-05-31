import NextAuth from "next-auth";
import { shopAuthOptions } from "./auth";

const handler = NextAuth(shopAuthOptions);
export { handler as GET, handler as POST }; 