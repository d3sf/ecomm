import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ClientInitializer } from "@/components/ClientInitializer";
import { CartProvider } from "@/contexts/CartContext";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Merugo",
  description: "Your one-stop shop for all your needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ClientInitializer />
          <CartProvider>
            <Toaster position="top-center" />
            {children}
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
