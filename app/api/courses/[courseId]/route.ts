import Mux from "@mux/mux-node";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

const updateCourseSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  subtitle: z.string().trim().max(280).nullable().optional(),
  description: z.string().min(1).nullable().optional(),
  imageUrl: z.string().min(1).nullable().optional(),
  price: z.coerce.number().positive().nullable().optional(),
  categoryId: z.string().min(1).nullable().optional(),
  level: z.string().trim().max(80).nullable().optional(),
  estimatedMinutes: z.coerce.number().int().positive().max(100000).nullable().optional(),
  outcomes: z.array(z.string().trim().min(1).max(240)).max(12).optional(),
  targetAudience: z.array(z.string().trim().min(1).max(240)).max(12).optional(),
  notForAudience: z.array(z.string().trim().min(1).max(240)).max(12).optional(),
  prerequisites: z.array(z.string().trim().min(1).max(240)).max(12).optional(),
  projectTitle: z.string().trim().max(180).nullable().optional(),
  projectDescription: z.string().trim().max(1200).nullable().optional(),
  projectImageUrl: z.string().min(1).nullable().optional(),
}).strict();

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!,
);

export async function DELETE(
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
        userId: userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          }
        }
      }
    });

    if (!course) {
      return new NextResponse("Curso no encontrado", { status: 404 });
    }

    await Promise.all(
      course.chapters
        .map((chapter) => chapter.muxData?.assetId)
        .filter((assetId): assetId is string => Boolean(assetId))
        .map((assetId) => Video.Assets.del(assetId)),
    );

    const deletedCourse = await db.course.delete({
      where: {
        id: courseId,
      },
    });

    revalidateTag("courses");

    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await getAdminUserId();
    const { courseId } = await params;
    const input = updateCourseSchema.safeParse(await req.json());

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    if (!input.success) {
      return new NextResponse("Los datos del curso no son válidos", { status: 400 });
    }

    const course = await db.course.update({
      where: {
        id: courseId,
        userId
      },
      data: {
        ...input.data,
      }
    });

    revalidateTag("courses");

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
