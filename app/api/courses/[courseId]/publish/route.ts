import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    void req;
    const userId = await getAdminUserId();
    const { courseId } = await params;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          }
        },
        faqs: true,
      }
    });

    if (!course) {
      return new NextResponse("Curso no encontrado", { status: 404 });
    }

    const hasPublishedChapter = course.chapters.some((chapter) => chapter.isPublished);
    const hasPublishedTrailer = course.chapters.some(
      (chapter) =>
        chapter.isPublished &&
        chapter.isTrailer &&
        Boolean(chapter.muxData?.playbackId),
    );

    if (
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.categoryId ||
      !course.price ||
      Number(course.price) <= 0 ||
      !course.subtitle ||
      !course.level ||
      !course.estimatedMinutes ||
      course.outcomes.length === 0 ||
      course.targetAudience.length === 0 ||
      !course.projectTitle ||
      !course.projectDescription ||
      course.faqs.length === 0 ||
      !hasPublishedChapter ||
      !hasPublishedTrailer
    ) {
      return new NextResponse("Faltan campos obligatorios", { status: 400 });
    }

    const publishedCourse = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        isPublished: true,
      }
    });

    revalidateTag("courses");

    return NextResponse.json(publishedCourse);
  } catch (error) {
    console.log("[COURSE_ID_PUBLISH]", error);
    return new NextResponse("Error interno", { status: 500 });
  } 
}
