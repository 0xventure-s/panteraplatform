import { Logo } from "./logo"
import { SidebarRoutes } from "./sidebar-routes"
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";

export const Sidebar = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-foreground/10 bg-card">
      <div className="px-6 py-7">
        <Logo />
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes canAccessAdmin={isAdmin(user)} />
      </div>
      <div className="mt-auto p-5">
        <div className="rounded-2xl bg-foreground p-4 text-background">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-secondary">
            Franco Alonso
          </p>
          <p className="mt-2 text-xs leading-5 text-background/60">
            IA aplicada a productos que se pueden usar.
          </p>
        </div>
      </div>
    </div>
  )
}
