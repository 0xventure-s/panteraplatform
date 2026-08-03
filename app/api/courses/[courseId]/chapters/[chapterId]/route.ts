import Mux from "@mux/mux-node";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

const updateChapterSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().min(1).optional(),
  videoUrl: z.string().min(1).optional(),
  moduleTitle: z.string().trim().max(120).nullable().optional(),
  durationMinutes: z.coerce.number().int().positive().max(10000).nullable().optional(),
  isFree: z.boolean().optional(),
  isTrailer: z.boolean().optional(),
}).strict();

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!,
);

export async function DELETE(
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
        userId,
      }
    });

    if (!ownCourse) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      }
    });

    if (!chapter) {
      return new NextResponse("Capítulo no encontrado", { status: 404 });
    }

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId,
        }
      });

      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          }
        });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: chapterId
      }
    });

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      }
    });

    if (!publishedChaptersInCourse.length || chapter.isTrailer) {
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

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const userId = await getAdminUserId();
    const { courseId, chapterId } = await params;
    const input = updateChapterSchema.safeParse(await req.json());

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    if (!input.success) {
      return new NextResponse("Los datos del capítulo no son válidos", { status: 400 });
    }

    const values = input.data;

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId
      }
    });

    if (!ownCourse) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const chapter = values.isTrailer
      ? await db.$transaction(async (transaction) => {
          await transaction.chapter.updateMany({
            where: {
              courseId,
              id: { not: chapterId },
            },
            data: { isTrailer: false },
          });

          return transaction.chapter.update({
            where: {
              id: chapterId,
              courseId,
            },
            data: {
              ...values,
              isFree: true,
            },
          });
        })
      : await db.chapter.update({
          where: {
            id: chapterId,
            courseId,
          },
          data: values,
        });

    if (values.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId,
        }
      });

      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          }
        });
      }

      const asset = await Video.Assets.create({
        input: values.videoUrl,
        playback_policy: "public",
        test: false,
      });

      await db.muxData.create({
        data: {
          chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        }
      });
    }

    if (values.isTrailer === false) {
      const publishedTrailer = await db.chapter.findFirst({
        where: {
          courseId,
          isPublished: true,
          isTrailer: true,
        },
        select: { id: true },
      });

      if (!publishedTrailer) {
        await db.course.update({
          where: { id: courseId },
          data: { isPublished: false },
        });
      }
    }

    revalidateTag("courses");

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
