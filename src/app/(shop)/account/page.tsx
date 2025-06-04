"use client";

import { Suspense } from "react";
import AccountPageContent from "@/components/account/AccountPageContent";

export default function AccountPage() {
    return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}

