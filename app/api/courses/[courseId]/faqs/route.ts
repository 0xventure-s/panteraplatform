import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUserId } from "@/lib/admin";
import { db } from "@/lib/db";

const faqSchema = z.object({
  items: z.array(
    z.object({
      question: z.string().trim().min(1).max(240),
      answer: z.string().trim().min(1).max(1200),
    }),
  ).max(20),
}).strict();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const userId = await getAdminUserId();
    const { courseId } = await params;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const input = faqSchema.safeParse(await req.json());

    if (!input.success) {
      return new NextResponse("Las preguntas no son válidas", { status: 400 });
    }

    const course = await db.course.findUnique({
      where: { id: courseId, userId },
      select: { id: true },
    });

    if (!course) {
      return new NextResponse("Curso no encontrado", { status: 404 });
    }

    await db.$transaction([
      db.courseFaq.deleteMany({ where: { courseId } }),
      ...input.data.items.map((item, position) =>
        db.courseFaq.create({
          data: {
            courseId,
            position,
            ...item,
          },
        }),
      ),
    ]);

    revalidateTag("courses");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("[COURSE_FAQS_UPDATE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
