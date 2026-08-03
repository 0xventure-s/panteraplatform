import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

const createCourseSchema = z.object({
  title: z.string().trim().min(1).max(160),
}).strict();

export async function POST(
  req: Request,
) {
  try {
    const userId = await getAdminUserId();
    const input = createCourseSchema.safeParse(await req.json());

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    if (!input.success) {
      return new NextResponse("El título no es válido", { status: 400 });
    }

    const course = await db.course.create({
      data: {
        userId,
        title: input.data.title,
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
