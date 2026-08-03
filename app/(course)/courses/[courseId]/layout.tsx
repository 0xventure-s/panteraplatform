import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";

import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";
import { getCurrentUserId } from "@/lib/session";

const CourseLayout = async ({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) => {
  const { courseId } = await params;
  const userId = await getCurrentUserId();

  if (!userId) {
    return redirect("/sign-in")
  }

  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            }
          }
        },
        orderBy: {
          position: "asc"
        }
      },
    },
  });

  if (!course) {
    return redirect("/cursos");
  }

  const progressCount = await getProgress(userId, course.id);

  return (
    <div className="min-h-full bg-background">
      <div className="fixed inset-y-0 z-50 h-[76px] w-full md:pl-80">
        <CourseNavbar
          course={course}
          progressCount={progressCount}
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
        />
      </div>
      <main className="min-h-full pt-[76px] md:pl-80">
        {children}
      </main>
    </div>
  )
}

export default CourseLayout
