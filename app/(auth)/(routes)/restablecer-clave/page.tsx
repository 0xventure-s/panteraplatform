import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-[420px] animate-pulse rounded-[28px] bg-card" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
