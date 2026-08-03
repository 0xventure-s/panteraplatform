import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { ThreeDIcon } from "@/components/three-d-icon";
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
      <section className="relative isolate min-h-[320px] overflow-hidden rounded-[30px] border border-foreground/10 bg-card shadow-[0_24px_70px_rgba(31,24,19,0.12)]">
        <Image
          src="/my-learning-banner.png"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) calc(100vw - 19rem), calc(100vw - 2.5rem)"
          className="object-cover object-[64%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent" />

        <div className="relative z-10 flex min-h-[320px] max-w-2xl flex-col justify-center p-7 md:p-10 lg:p-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
            Mi campus
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[0.92] tracking-[-0.035em] md:text-6xl">
            Sigue construyendo.
          </h1>
          <p className="mt-4 max-w-lg text-sm font-medium leading-7 text-foreground/65 md:text-base">
            Tu avance queda guardado. Retoma el curso desde la próxima lección.
          </p>
          <div className="mt-7">
            {activeCourse ? (
              <Button asChild className="h-11 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
                <Link href={activeCourse.nextChapterId ? `/cursos/${activeCourse.id}/capitulos/${activeCourse.nextChapterId}` : `/cursos/${activeCourse.id}`}>
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild className="h-11 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
                <Link href="/search">Explorar cursos</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-[22px] border border-foreground/10 bg-card p-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center">
            <ThreeDIcon name="clock" size={48} className="-rotate-3" />
          </span>
          <div>
            <p className="text-2xl font-extrabold">{coursesInProgress.length}</p>
            <p className="text-sm text-muted-foreground">Cursos en progreso</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[22px] border border-foreground/10 bg-card p-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center">
            <ThreeDIcon name="tick" size={46} />
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
