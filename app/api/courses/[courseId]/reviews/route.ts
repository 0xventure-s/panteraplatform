import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(12).max(1200),
}).strict();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    const { courseId } = await params;

    if (!userId) {
      return new NextResponse("Iniciá sesión para dejar tu opinión", { status: 401 });
    }

    const input = reviewSchema.safeParse(await req.json());

    if (!input.success) {
      return new NextResponse("La opinión no es válida", { status: 400 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      select: { id: true },
    });

    if (!purchase) {
      return new NextResponse("Solo pueden opinar quienes compraron el curso", { status: 403 });
    }

    const review = await db.courseReview.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      create: {
        userId,
        courseId,
        ...input.data,
      },
      update: input.data,
    });

    revalidateTag("courses");

    return NextResponse.json(review);
  } catch (error) {
    console.log("[COURSE_REVIEW_UPSERT]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
