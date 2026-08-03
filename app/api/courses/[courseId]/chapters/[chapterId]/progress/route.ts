import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const [userId, { courseId, chapterId }, body] = await Promise.all([
      getCurrentUserId(),
      params,
      req.json() as Promise<{ isCompleted: boolean }>,
    ]);
    const { isCompleted } = body;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    } 

    const [chapter, purchase] = await Promise.all([
      db.chapter.findUnique({
        where: {
          id: chapterId,
          courseId,
          isPublished: true,
        },
        select: { id: true, isFree: true },
      }),
      db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        select: { id: true },
      }),
    ]);

    if (!chapter) {
      return new NextResponse("Capítulo no encontrado", { status: 404 });
    }

    if (!chapter.isFree && !purchase) {
      return new NextResponse("No tenés acceso a este capítulo", { status: 403 });
    }

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        }
      },
      update: {
        isCompleted
      },
      create: {
        userId,
        chapterId,
        isCompleted,
      }
    });

    revalidateTag("community-leaderboard");

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
