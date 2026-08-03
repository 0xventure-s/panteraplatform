import { redirect } from "next/navigation";

import { getAdminUserId } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdminUserId())) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
