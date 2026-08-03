import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";

const CourseLayout = async ({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) => {
  const { courseId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/sign-in")
  }

  const [course, purchase] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            isFree: true,
            userProgress: {
              where: { userId: user.id },
              select: { isCompleted: true },
              take: 1,
            },
          },
        },
      },
    }),
    db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      select: { id: true },
    }),
  ]);

  if (!course) {
    return redirect("/cursos");
  }

  const completedChapters = course.chapters.filter(
    (chapter) => chapter.userProgress[0]?.isCompleted,
  ).length;
  const progressCount = course.chapters.length
    ? (completedChapters / course.chapters.length) * 100
    : 0;
  const hasAccess = Boolean(purchase);

  return (
    <div className="min-h-full bg-background">
      <div className="fixed inset-y-0 z-50 h-[76px] w-full md:pl-80">
        <CourseNavbar
          canAccessAdmin={isAdmin(user)}
          course={course}
          hasAccess={hasAccess}
          progressCount={progressCount}
          userName={user.name}
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={course}
          hasAccess={hasAccess}
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
