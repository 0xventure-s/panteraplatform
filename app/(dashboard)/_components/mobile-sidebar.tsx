import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export const MobileSidebar = () => {
  return (
    <div className="mobile-sidebar-trigger md:hidden">
      <Sheet>
        <SheetTrigger className="pr-4 transition hover:opacity-75" aria-label="Abrir navegación">
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="bg-card p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  )
}
