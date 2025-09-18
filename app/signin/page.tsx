"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") || "/analysis";

  useEffect(() => {
    // Automatically redirect to the target page without authentication
    router.replace(from);
  }, [router, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="w-full max-w-sm p-6 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
        <h2 className="text-2xl font-semibold text-center mb-6 text-black dark:text-white">Redirecting...</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    </div>
  );
}


