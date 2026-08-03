import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

import { CourseSidebar } from "./course-sidebar";
import type { CourseNavigationData } from "./course-sidebar";

interface CourseMobileSidebarProps {
  course: CourseNavigationData;
  hasAccess: boolean;
  progressCount: number;
};

export const CourseMobileSidebar = ({ 
  course,
  hasAccess,
  progressCount,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white w-72">
        <CourseSidebar
          course={course}
          hasAccess={hasAccess}
          progressCount={progressCount}
        />
      </SheetContent>
    </Sheet>
  )
}
