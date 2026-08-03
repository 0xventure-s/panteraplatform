"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface MarketingFrameProps {
  brand: ReactNode;
  children: ReactNode;
  floatingAction: ReactNode;
  navbar: ReactNode;
  sidebar: ReactNode;
}

export const MarketingFrame = ({
  brand,
  children,
  floatingAction,
  navbar,
  sidebar,
}: MarketingFrameProps) => {
  const pathname = usePathname();
  const isCourseRoute =
    pathname === "/cursos" || pathname.startsWith("/cursos/");

  return (
    <div className="min-h-full bg-background">
      <div
        className={cn(
          "fixed inset-y-0 z-50 h-[76px] w-full",
          !isCourseRoute && "md:pl-64",
        )}
      >
        <div className="flex h-full">
          {isCourseRoute && (
            <div className="flex shrink-0 items-center border-b border-foreground/10 bg-background/90 px-5 backdrop-blur-xl sm:px-7">
              {brand}
            </div>
          )}
          <div
            className={cn(
              "min-w-0 flex-1",
              isCourseRoute && "[&_.mobile-sidebar-trigger]:hidden",
            )}
          >
            {navbar}
          </div>
        </div>
      </div>

      {!isCourseRoute && (
        <div className="fixed inset-y-0 z-50 hidden h-full w-64 flex-col md:flex">
          {sidebar}
        </div>
      )}

      <div
        className={cn(
          "min-h-full pt-[76px]",
          !isCourseRoute && "md:pl-64",
        )}
      >
        {children}
      </div>

      {!isCourseRoute && floatingAction}
    </div>
  );
};
