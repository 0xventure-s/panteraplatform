import { Chapter, Course, UserProgress } from "@prisma/client"

import { NavbarRoutes } from "@/components/navbar-routes";

import { CourseMobileSidebar } from "./course-mobile-sidebar";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";

interface CourseNavbarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
};

export const CourseNavbar = async ({
  course,
  progressCount,
}: CourseNavbarProps) => {
  const user = await getCurrentUser();

  return (
    <div className="flex h-full items-center border-b border-foreground/10 bg-background/90 p-4 backdrop-blur-xl">
      <CourseMobileSidebar
        course={course}
        progressCount={progressCount}
      />
      <NavbarRoutes
        canAccessAdmin={isAdmin(user)}
        isAuthenticated={Boolean(user)}
      />
    </div>
  )
}
