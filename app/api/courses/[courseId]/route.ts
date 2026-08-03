import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

const updateCourseSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().min(1).optional(),
  imageUrl: z.string().min(1).optional(),
  price: z.coerce.number().positive().optional(),
  categoryId: z.string().min(1).optional(),
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

    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        await Video.Assets.del(chapter.muxData.assetId);
      }
    }

    const deletedCourse = await db.course.delete({
      where: {
        id: courseId,
      },
    });

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

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
