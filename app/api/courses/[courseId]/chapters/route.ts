import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

const createChapterSchema = z.object({
  title: z.string().trim().min(1).max(160),
}).strict();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await getAdminUserId();
    const { courseId } = await params;
    const input = createChapterSchema.safeParse(await req.json());

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    if (!input.success) {
      return new NextResponse("El título no es válido", { status: 400 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId,
      }
    });

    if (!courseOwner) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const chapter = await db.chapter.create({
      data: {
        title: input.data.title,
        courseId,
        position: newPosition,
      }
    });

    revalidateTag("courses");

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
