"use client";

import { BarChart3, Compass, CreditCard, LayoutDashboard, List } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";

const studentRoutes = [
  {
    icon: LayoutDashboard,
    label: "Mi aprendizaje",
    href: "/dashboard",
  },
  {
    icon: Compass,
    label: "Explorar cursos",
    href: "/search",
  },
];

const adminRoutes = [
  {
    icon: List,
    label: "Cursos",
    href: "/admin/cursos",
  },
  {
    icon: BarChart3,
    label: "Analíticas",
    href: "/admin/analiticas",
  },
  {
    icon: CreditCard,
    label: "Integraciones",
    href: "/admin/integraciones",
  },
]

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
          <SidebarItem icon={List} label="Administración" href="/admin/cursos" />
        </div>
      )}
    </div>
  )
}
