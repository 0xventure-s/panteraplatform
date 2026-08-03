import { Chapter, Course, UserProgress } from "@prisma/client"
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseProgress } from "@/components/course-progress";

import { CourseSidebarItem } from "./course-sidebar-item";
import { getCurrentUserId } from "@/lib/session";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[]
  };
  progressCount: number;
};

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return redirect("/sign-in");
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      }
    }
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-foreground/10 bg-card">
      <div className="flex flex-col border-b border-foreground/10 p-7">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-accent">Curso</p>
        <h1 className="mt-3 text-xl font-extrabold leading-tight tracking-[-0.03em]">
          {course.title}
        </h1>
        {purchase && (
          <div className="mt-7">
            <CourseProgress
              variant="success"
              value={progressCount}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  )
}
