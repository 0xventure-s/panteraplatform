import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { courseId, chapterId } = await params;
    const { isCompleted } = await req.json();

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    } 

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
        isPublished: true,
      },
    });

    if (!chapter) {
      return new NextResponse("Capítulo no encontrado", { status: 404 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

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
    })

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
