import { NavbarRoutes } from "@/components/navbar-routes";

import { CourseMobileSidebar } from "./course-mobile-sidebar";
import type { CourseNavigationData } from "./course-sidebar";

interface CourseNavbarProps {
  canAccessAdmin: boolean;
  course: CourseNavigationData;
  hasAccess: boolean;
  progressCount: number;
  userName: string;
};

export const CourseNavbar = ({
  canAccessAdmin,
  course,
  hasAccess,
  progressCount,
  userName,
}: CourseNavbarProps) => {
  return (
    <div className="flex h-full items-center border-b border-foreground/10 bg-background/90 p-4 backdrop-blur-xl">
      <CourseMobileSidebar
        course={course}
        hasAccess={hasAccess}
        progressCount={progressCount}
      />
      <NavbarRoutes
        canAccessAdmin={canAccessAdmin}
        isAuthenticated
        userName={userName}
      />
    </div>
  )
}
