import "server-only";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { after } from "next/server";

import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { getRobotAvatarPath } from "@/lib/profile-avatar";

const normalizeOrigin = (value?: string) => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const appUrl = normalizeOrigin(
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
);
const trustedOrigins = Array.from(
  new Set(
    [
      normalizeOrigin(process.env.BETTER_AUTH_URL),
      normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL),
      ...(process.env.NODE_ENV === "production"
        ? []
        : ["http://localhost:3000", "http://127.0.0.1:3000"]),
    ].filter((origin): origin is string => Boolean(origin)),
  ),
);
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

export const auth = betterAuth({
  appName: "Kiwi Academia",
  baseURL: appUrl ?? undefined,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      after(async () => {
        try {
          await sendPasswordResetEmail({
            email: user.email,
            name: user.name,
            url,
          });
        } catch (error) {
          console.error("[PASSWORD_RESET_EMAIL]", error);
        }
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            image: user.image?.trim() || getRobotAvatarPath(user.id || user.email),
            role:
              adminEmail && user.email.toLowerCase() === adminEmail
                ? "admin"
                : "user",
          },
        }),
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwe",
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
