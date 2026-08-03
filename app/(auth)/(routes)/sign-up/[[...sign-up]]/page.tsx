import { Suspense } from "react";

import { CredentialsForm } from "@/components/auth/credentials-form";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="h-[580px] animate-pulse rounded-[28px] bg-card" />}>
      <CredentialsForm mode="sign-up" />
    </Suspense>
  );
}
