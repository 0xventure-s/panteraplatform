import { CourseProgress } from "@/components/course-progress";

import { CourseSidebarItem } from "./course-sidebar-item";

export interface CourseNavigationData {
  id: string;
  title: string;
  chapters: Array<{
    id: string;
    title: string;
    isFree: boolean;
    userProgress: Array<{ isCompleted: boolean }>;
  }>;
}

interface CourseSidebarProps {
  course: CourseNavigationData;
  hasAccess: boolean;
  progressCount: number;
};

export const CourseSidebar = ({
  course,
  hasAccess,
  progressCount,
}: CourseSidebarProps) => {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-foreground/10 bg-card">
      <div className="flex flex-col border-b border-foreground/10 p-7">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-accent">Curso</p>
        <h1 className="mt-3 text-xl font-extrabold leading-tight tracking-[-0.03em]">
          {course.title}
        </h1>
        {hasAccess && (
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
            isLocked={!chapter.isFree && !hasAccess}
          />
        ))}
      </div>
    </div>
  )
}
