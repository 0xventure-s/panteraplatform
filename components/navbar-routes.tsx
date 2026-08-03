"use client";

import { usePathname } from "next/navigation";
import { ArrowLeft, Loader2, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { SearchInput } from "./search-input";

export const NavbarRoutes = ({ canAccessAdmin = false }: { canAccessAdmin?: boolean }) => {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isAdminPage = pathname?.startsWith("/admin");
  const isCoursePage = pathname?.includes("/courses") || pathname?.includes("/capitulos/");
  const isSearchPage = pathname === "/search";

  const onSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.assign("/");
        },
      },
    });
    setIsSigningOut(false);
  };

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2 ml-auto">
        {isAdminPage || isCoursePage ? (
          <Link href="/dashboard">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al campus
            </Button>
          </Link>
        ) : canAccessAdmin ? (
          <Link href="/admin/cursos">
            <Button size="sm" variant="outline" className="rounded-full">
              <Settings className="mr-2 h-4 w-4" />
              Administración
            </Button>
          </Link>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onSignOut}
          disabled={isSigningOut}
          className="rounded-full"
          title={session?.user.name || "Cerrar sesión"}
        >
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{session?.user.name || "Mi cuenta"}</span>
              <LogOut className="ml-2 hidden h-4 w-4 sm:block" />
            </>
          )}
          <span className="sr-only">Cerrar sesión</span>
        </Button>
      </div>
    </>
  )
}
