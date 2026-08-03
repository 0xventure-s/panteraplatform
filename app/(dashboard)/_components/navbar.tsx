import { NavbarRoutes } from "@/components/navbar-routes"

import { MobileSidebar } from "./mobile-sidebar"
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";

export const Navbar = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex h-full items-center border-b border-foreground/10 bg-background/90 px-4 backdrop-blur-xl md:px-6">
      <MobileSidebar />
      <NavbarRoutes
        canAccessAdmin={isAdmin(user)}
        isAuthenticated={Boolean(user)}
        userName={user?.name}
      />
    </div>
  )
}
