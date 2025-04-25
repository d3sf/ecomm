"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") || false;
  const basePath = isAdmin ? "/api/admin-auth" : "/api/shop-auth";
  
  useEffect(() => {
    console.log(`SessionProviderWrapper: Path = ${pathname}, isAdmin = ${isAdmin}, basePath = ${basePath}`);
  }, [pathname, isAdmin, basePath]);
  
  return (
    <SessionProvider
      basePath={basePath}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
} 