"use client";

import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
};

export const SidebarItem = ({
  icon: Icon,
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
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "mx-3 flex items-center gap-x-2 rounded-xl pl-3 text-sm font-bold text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
        isActive && "bg-foreground text-background hover:bg-foreground hover:text-background"
      )}
    >
      <div className="flex items-center gap-x-3 py-3">
        <Icon
          size={22}
          className={cn(
            "text-muted-foreground",
            isActive && "text-secondary"
          )}
        />
        {label}
      </div>
    </button>
  )
}
