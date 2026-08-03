"use client";

import { usePathname } from "next/navigation";

import type { ThreeDIconName } from "@/components/three-d-icon";

import { SidebarItem } from "./sidebar-item";

interface SidebarRoute {
  icon: ThreeDIconName;
  label: string;
  href: string;
}

const studentRoutes: SidebarRoute[] = [
  {
    icon: "zoom",
    label: "Explorar cursos",
    href: "/search",
  },
  {
    icon: "computer",
    label: "Mi aprendizaje",
    href: "/dashboard",
  },
  {
    icon: "chart",
    label: "Ranking",
    href: "/ranking",
  },
  {
    icon: "profile",
    label: "Mi perfil",
    href: "/perfil",
  },
];

const adminRoutes: SidebarRoute[] = [
  {
    icon: "notebook",
    label: "Cursos",
    href: "/admin/cursos",
  },
  {
    icon: "chart",
    label: "Analíticas",
    href: "/admin/analiticas",
  },
  {
    icon: "link",
    label: "Integraciones",
    href: "/admin/integraciones",
  },
];

export const SidebarRoutes = ({ canAccessAdmin }: { canAccessAdmin: boolean }) => {
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith("/admin");

  const routes = isAdminPage ? adminRoutes : studentRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
      {!isAdminPage && canAccessAdmin && (
        <div className="mt-5 border-t border-foreground/10 pt-5">
          <SidebarItem icon="notebook" label="Administración" href="/admin/cursos" />
        </div>
      )}
    </div>
  );
};
