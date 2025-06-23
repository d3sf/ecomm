"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") || false;
  const basePath = isAdmin ? "/api/admin-auth" : "/api/shop-auth";
  
  return (
    <SessionProvider
      basePath={basePath}
      refetchInterval={30 * 60} // Refetch session every 30 minutes instead of 5
      refetchOnWindowFocus={false} // Disable refetch on window focus to prevent unnecessary requests
      refetchWhenOffline={false} // Disable refetch when offline
    >
      {children}
    </SessionProvider>
  );
} 