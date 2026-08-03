import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const getSession = async () =>
  auth.api.getSession({
    headers: await headers(),
  });

export const getCurrentUser = async () => {
  const session = await getSession();

  return session?.user ?? null;
};

export const getCurrentUserId = async () => {
  const user = await getCurrentUser();

  return user?.id ?? null;
};
