import { Suspense } from "react";

import { CredentialsForm } from "@/components/auth/credentials-form";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="h-[520px] animate-pulse rounded-[28px] bg-card" />}>
      <CredentialsForm mode="sign-in" />
    </Suspense>
  );
}
