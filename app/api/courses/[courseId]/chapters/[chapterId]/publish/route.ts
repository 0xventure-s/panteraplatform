import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    void req;
    const userId = await getAdminUserId();
    const { courseId, chapterId } = await params;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId
      }
    });

    if (!ownCourse) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const [chapter, muxData] = await Promise.all([
      db.chapter.findUnique({
        where: {
          id: chapterId,
          courseId,
        },
      }),
      db.muxData.findUnique({
        where: { chapterId },
      }),
    ]);

    if (
      !chapter ||
      !muxData?.playbackId ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl ||
      !chapter.moduleTitle ||
      !chapter.durationMinutes
    ) {
      return new NextResponse("Faltan campos obligatorios", { status: 400 });
    }

    const publishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: true,
      }
    });

    revalidateTag("courses");

    return NextResponse.json(publishedChapter);
  } catch (error) {
    console.log("[CHAPTER_PUBLISH]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
