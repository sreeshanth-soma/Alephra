"use client";

import { Suspense } from "react";
import SignInPageContent from "./SignInPageContent";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SignInPageContent />
    </Suspense>
  );
}
