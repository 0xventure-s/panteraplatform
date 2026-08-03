import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

const nullableText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => value || null);

const profileImage = nullableText(2048).refine(
  (value) =>
    !value ||
    value.startsWith("/") ||
    (() => {
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    })(),
  "La foto de perfil no es válida.",
);

const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    image: profileImage,
    headline: nullableText(120),
    bio: nullableText(600),
    location: nullableText(80),
    links: z
      .array(
        z.object({
          label: z.string().trim().min(2).max(40),
          url: z
            .string()
            .trim()
            .url()
            .refine((value) => {
              try {
                return ["http:", "https:"].includes(new URL(value).protocol);
              } catch {
                return false;
              }
            }),
        }),
      )
      .max(8),
  })
  .superRefine((profile, context) => {
    const urls = profile.links.map((link) => link.url.toLowerCase());

    if (new Set(urls).size !== urls.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cada enlace debe ser único.",
        path: ["links"],
      });
    }
  });

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Ingresá para actualizar tu perfil." },
      { status: 401 },
    );
  }

  try {
    const profile = profileSchema.parse(await request.json());

    await db.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: userId },
        data: {
          name: profile.name,
          image: profile.image,
          headline: profile.headline,
          bio: profile.bio,
          location: profile.location,
        },
      });
      await transaction.profileLink.deleteMany({ where: { userId } });

      if (profile.links.length > 0) {
        await transaction.profileLink.createMany({
          data: profile.links.map((link, position) => ({
            userId,
            label: link.label,
            url: link.url,
            position,
          })),
        });
      }
    });

    revalidatePath("/ranking");
    revalidatePath("/perfil");
    revalidatePath(`/perfil/${userId}`);
    revalidatePath("/cursos/[courseId]", "page");
    revalidateTag("community-leaderboard");

    return NextResponse.json({ message: "Perfil actualizado." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Revisá los datos y los enlaces ingresados." },
        { status: 400 },
      );
    }

    console.error("[PROFILE_UPDATE]", error);
    return NextResponse.json(
      { message: "No pudimos guardar los cambios. Intentá nuevamente." },
      { status: 500 },
    );
  }
}
