import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getAdminUserId } from "@/lib/admin";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; attachmentId: string }> }
) {
  try {
    void req;
    const userId = await getAdminUserId();
    const { courseId, attachmentId } = await params;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId
      }
    });

    if (!courseOwner) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const attachment = await db.attachment.delete({
      where: {
        courseId,
        id: attachmentId,
      }
    });

    revalidateTag("courses");

    return NextResponse.json(attachment);
  } catch (error) {
    console.log("ATTACHMENT_ID", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

