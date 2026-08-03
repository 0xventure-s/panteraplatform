import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await getAdminUserId();
    const { courseId } = await params;
    const { url } = await req.json();

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
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

    const attachment = await db.attachment.create({
      data: {
        url,
        name: url.split("/").pop(),
        courseId,
      }
    });

    revalidateTag("courses");

    return NextResponse.json(attachment);
  } catch (error) {
    console.log("COURSE_ID_ATTACHMENTS", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
