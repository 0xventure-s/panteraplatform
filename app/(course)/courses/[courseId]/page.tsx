import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
  params
}: {
  params: Promise<{ courseId: string }>
}) => {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc"
        }
      }
    }
  });

  if (!course) {
    return redirect("/cursos");
  }

  if (!course.chapters[0]) {
    return redirect(`/cursos/${course.id}`);
  }

  return redirect(`/cursos/${course.id}/capitulos/${course.chapters[0].id}`);
}
 
export default CourseIdPage;
