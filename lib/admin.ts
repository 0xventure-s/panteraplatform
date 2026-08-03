import "server-only";

import { getCurrentUser } from "@/lib/session";

interface AdminCandidate {
  id: string;
  email: string;
  role?: string | null;
}

export const isAdmin = (user?: AdminCandidate | null) => {
  if (!user) {
    return false;
  }

  const adminUserId = process.env.ADMIN_USER_ID?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return Boolean(
    user.role === "admin" ||
      (adminUserId && user.id === adminUserId) ||
      (adminEmail && user.email.toLowerCase() === adminEmail),
  );
};

export const getAdminUserId = async () => {
  const user = await getCurrentUser();

  return isAdmin(user) ? user?.id ?? null : null;
};
