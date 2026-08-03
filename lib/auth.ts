import "server-only";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { after } from "next/server";

import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const appUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

export const auth = betterAuth({
  appName: "Franco Alonso",
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins: appUrl ? [appUrl] : [],
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
