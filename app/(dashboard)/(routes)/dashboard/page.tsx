import { ArrowRight, CheckCircle, Clock3 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/session";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/sign-in");
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(userId);
  const activeCourse = coursesInProgress[0];

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-5 md:p-8 lg:p-10">
      <section className="overflow-hidden rounded-[30px] bg-foreground text-background">
        <div className="soft-noise grid gap-8 p-7 md:grid-cols-[1fr_auto] md:items-end md:p-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">
              Mi campus
            </p>
            <h1 className="mt-4 font-display text-5xl leading-none md:text-7xl">
              Seguí construyendo.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-background/65 md:text-base">
              Tu avance queda guardado. Volvé al curso y retomá desde la próxima lección.
            </p>
          </div>
          {activeCourse ? (
            <Button asChild className="h-12 rounded-full bg-secondary px-6 text-foreground hover:bg-secondary/90">
              <Link href={activeCourse.nextChapterId ? `/cursos/${activeCourse.id}/capitulos/${activeCourse.nextChapterId}` : `/cursos/${activeCourse.id}`}>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild className="h-12 rounded-full bg-secondary px-6 text-foreground hover:bg-secondary/90">
              <Link href="/search">Explorar cursos</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-card p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary">
            <Clock3 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-extrabold">{coursesInProgress.length}</p>
            <p className="text-sm text-muted-foreground">Cursos en progreso</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-card p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-extrabold">{completedCourses.length}</p>
            <p className="text-sm text-muted-foreground">Cursos completados</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
              Tu recorrido
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">Mis cursos</h2>
          </div>
          <Link href="/search" className="text-sm font-bold hover:text-accent">
            Ver catálogo
          </Link>
        </div>
        <CoursesList items={[...coursesInProgress, ...completedCourses]} emptyState="Todavía no tenés cursos. Elegí el primero para empezar." />
      </section>
    </div>
  );
}
