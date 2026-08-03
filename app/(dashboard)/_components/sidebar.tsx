import { Logo } from "./logo"
import { SidebarRoutes } from "./sidebar-routes"
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";

export const Sidebar = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-foreground/10 bg-card">
      <div className="px-6 py-7">
        <Logo href={user ? "/dashboard" : "/search"} />
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes canAccessAdmin={isAdmin(user)} />
      </div>
      
    </div>
  );
};
