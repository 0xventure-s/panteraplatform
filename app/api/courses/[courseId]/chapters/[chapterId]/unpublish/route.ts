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

    const unpublishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: false,
      }
    });

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      }
    });

    if (!publishedChaptersInCourse.length || unpublishedChapter.isTrailer) {
      await db.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        }
      });
    }

    revalidateTag("courses");

    return NextResponse.json(unpublishedChapter);
  } catch (error) {
    console.log("[CHAPTER_UNPUBLISH]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
