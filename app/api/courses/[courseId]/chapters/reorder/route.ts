import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await getAdminUserId();
    const { courseId } = await params;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const { list } = (await req.json()) as {
      list?: Array<{ id: string; position: number }>;
    };

    if (!Array.isArray(list)) {
      return new NextResponse("El orden no es válido", { status: 400 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId
      }
    });

    if (!ownCourse) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    await db.$transaction(
      list.map((item) =>
        db.chapter.update({
          where: { id: item.id, courseId },
          data: { position: item.position },
        }),
      ),
    );

    revalidateTag("courses");

    return new NextResponse("Orden actualizado", { status: 200 });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
