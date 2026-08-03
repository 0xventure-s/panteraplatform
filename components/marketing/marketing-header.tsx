import Link from "next/link";

import { SiteLogo } from "@/components/site-logo";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/session";

export const MarketingHeader = async () => {
  const userId = await getCurrentUserId();

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-5 lg:px-8">
        <SiteLogo />
        <nav className="ml-auto hidden items-center gap-7 text-sm font-bold md:flex">
          <Link className="transition hover:text-accent" href="/cursos">
            Cursos
          </Link>
          <Link className="transition hover:text-accent" href="/#metodo">
            Método
          </Link>
          <Link className="transition hover:text-accent" href="/#preguntas">
            Preguntas
          </Link>
        </nav>
        <Button asChild className="rounded-full px-5">
          <Link href={userId ? "/dashboard" : "/sign-in"}>
            {userId ? "Ir a mi campus" : "Ingresar"}
          </Link>
        </Button>
      </div>
    </header>
  );
};
