"use client";

import { ArrowLeft, Loader2, LogOut, Settings, User } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const SearchInput = dynamic(
  () => import("./search-input").then((module) => module.SearchInput),
  { ssr: false },
);

interface NavbarRoutesProps {
  canAccessAdmin?: boolean;
  isAuthenticated?: boolean;
  userName?: string | null;
}

export const NavbarRoutes = ({
  canAccessAdmin = false,
  isAuthenticated = false,
  userName,
}: NavbarRoutesProps) => {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isAdminPage = pathname?.startsWith("/admin");
  const isCoursePage = pathname?.includes("/courses") || pathname?.includes("/capitulos/");
  const isSearchPage = pathname === "/search";

  const onSignOut = async () => {
    setIsSigningOut(true);

    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión");
      }

      window.location.assign("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="ml-auto flex gap-x-2">
        {!isAuthenticated ? (
          <Button asChild size="sm" className="rounded-full px-5">
            <Link href="/sign-in?callbackURL=%2Fsearch">
              <User className="mr-2 h-4 w-4" />
              Ingresar
            </Link>
          </Button>
        ) : (
          <>
            {isCoursePage ? (
              <Link href="/search">
                <Button size="sm" variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a cursos
                </Button>
              </Link>
            ) : isAdminPage ? (
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
              title={userName || "Cerrar sesión"}
            >
              {isSigningOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <User className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{userName || "Mi cuenta"}</span>
                  <LogOut className="ml-2 hidden h-4 w-4 sm:block" />
                </>
              )}
              <span className="sr-only">Cerrar sesión</span>
            </Button>
          </>
        )}
      </div>
    </>
  );
};
