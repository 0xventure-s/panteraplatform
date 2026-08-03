"use client";

import { usePathname, useRouter } from "next/navigation";

import { ThreeDIcon, type ThreeDIconName } from "@/components/three-d-icon";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: ThreeDIconName;
  label: string;
  href: string;
}

export const SidebarItem = ({
  icon,
  label,
  href,
}: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive =
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "mx-3 flex min-h-12 items-center rounded-2xl px-3 text-left text-sm font-bold text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
        isActive && "bg-foreground text-background hover:bg-foreground hover:text-background"
      )}
    >
      <div className="flex flex-1 items-center gap-x-3 py-2">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center transition-transform",
            isActive && "scale-110"
          )}
        >
          <ThreeDIcon
            name={icon}
            size={29}
            className={cn("transition-transform", isActive && "scale-110")}
          />
        </span>
        {label}
      </div>
    </button>
  );
};
