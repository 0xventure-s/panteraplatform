import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Crown,
  MapPin,
  Sparkles,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileAvatar } from "@/components/community/profile-avatar";
import { Progress } from "@/components/ui/progress";
import { getLeaderboard } from "@/lib/community";
import { getCurrentUserId } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function RankingPage() {
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    redirect("/sign-in");
  }

  const leaderboard = await getLeaderboard();
  const currentEntry = leaderboard.find((entry) => entry.id === currentUserId);
  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-5 md:p-8 lg:p-10">
      <section className="relative isolate min-h-[390px] overflow-hidden rounded-[32px] border border-foreground/10 bg-card shadow-[0_24px_70px_rgba(31,24,19,0.12)]">
        <Image
          src="/ranking-banner.png"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) calc(100vw - 19rem), calc(100vw - 2.5rem)"
          className="object-cover object-[64%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />

        <div className="relative z-10 flex min-h-[390px] max-w-3xl flex-col justify-center p-7 md:p-10 lg:p-12">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
            <Trophy className="h-4 w-4" />
            Comunidad
          </div>
          <h1 className="mt-5 max-w-2xl font-display text-5xl leading-[0.9] tracking-[-0.04em] md:text-7xl">
            Una comunidad en movimiento.
          </h1>
          <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-foreground/65 md:text-base">
            Conoce a quienes están aprendiendo, compara recorridos y sigue tu posición.
          </p>
          <p className="mt-2 text-xs font-bold text-foreground/45">
            La posición se calcula con lecciones completadas, cursos terminados y progreso total.
          </p>

          <div className="mt-7 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-foreground/10 bg-background/75 p-4 backdrop-blur-md">
              <p className="font-display text-4xl leading-none">{leaderboard.length}</p>
              <p className="mt-2 text-xs text-foreground/55">Personas aprendiendo</p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-secondary/90 p-4 text-foreground backdrop-blur-md">
              <p className="font-display text-4xl leading-none">
                {currentEntry ? `#${currentEntry.position}` : "—"}
              </p>
              <p className="mt-2 text-xs font-bold text-foreground/60">Tu posición</p>
            </div>
          </div>
        </div>
      </section>

      {leaderboard.length > 0 ? (
        <>
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
                  En movimiento
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
                  Los primeros puestos
                </h2>
              </div>
              <Sparkles className="h-6 w-6 text-accent" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {topThree.map((entry) => {
                const isFirst = entry.position === 1;
                const isCurrent = entry.id === currentUserId;

                return (
                  <Link
                    key={entry.id}
                    href={isCurrent ? "/perfil" : `/perfil/${entry.id}`}
                    className={cn(
                      "group relative overflow-hidden rounded-[26px] border border-foreground/10 bg-card p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(30,24,20,0.10)]",
                      isFirst && "bg-secondary",
                    )}
                  >
                    <span className="absolute right-5 top-3 font-display text-8xl leading-none text-foreground/[0.055]">
                      {String(entry.position).padStart(2, "0")}
                    </span>
                    <div className="relative flex items-start justify-between gap-5">
                      <ProfileAvatar
                        userId={entry.id}
                        name={entry.name}
                        image={entry.image}
                        className="h-16 w-16 text-lg"
                      />
                      {isFirst ? (
                        <Crown className="h-6 w-6" />
                      ) : (
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-foreground/15 text-xs font-extrabold">
                          #{entry.position}
                        </span>
                      )}
                    </div>
                    <div className="relative mt-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-extrabold tracking-[-0.03em]">
                          {entry.name}
                        </h3>
                        {isCurrent && (
                          <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-background">
                            Vos
                          </span>
                        )}
                      </div>
                      {entry.headline && (
                        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-muted-foreground">
                          {entry.headline}
                        </p>
                      )}
                      {entry.location && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {entry.location}
                        </p>
                      )}
                      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-foreground/10 pt-5">
                        <div>
                          <p className="text-2xl font-extrabold">{entry.completedLessons}</p>
                          <p className="text-xs text-muted-foreground">Lecciones</p>
                        </div>
                        <div>
                          <p className="text-2xl font-extrabold">{entry.overallProgress}%</p>
                          <p className="text-xs text-muted-foreground">Progreso total</p>
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between text-sm font-extrabold">
                        Ver perfil
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
                Clasificación
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
                Progreso de la comunidad
              </h2>
            </div>

            <div className="overflow-hidden rounded-[26px] border border-foreground/10 bg-card">
              <div className="hidden grid-cols-[64px_1.4fr_0.8fr_0.7fr_32px] gap-5 border-b border-foreground/10 px-6 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground md:grid">
                <span>Puesto</span>
                <span>Perfil</span>
                <span>Progreso</span>
                <span>Completado</span>
                <span />
              </div>
              <div className="divide-y divide-foreground/10">
                {leaderboard.map((entry) => {
                  const isCurrent = entry.id === currentUserId;

                  return (
                    <Link
                      key={entry.id}
                      href={isCurrent ? "/perfil" : `/perfil/${entry.id}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={cn(
                        "group grid gap-4 px-5 py-5 transition hover:bg-muted/60 md:grid-cols-[64px_1.4fr_0.8fr_0.7fr_32px] md:items-center md:gap-5 md:px-6",
                        isCurrent && "bg-secondary/35",
                      )}
                    >
                      <div className="flex items-center justify-between md:block">
                        <span
                          className={cn(
                            "font-display text-3xl text-muted-foreground",
                            entry.position <= 3 && "text-accent",
                          )}
                        >
                          {String(entry.position).padStart(2, "0")}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-background md:hidden">
                            Vos
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 items-center gap-3">
                        <ProfileAvatar
                          userId={entry.id}
                          name={entry.name}
                          image={entry.image}
                          className="h-11 w-11 text-sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-extrabold">{entry.name}</p>
                            {isCurrent && (
                              <span className="hidden rounded-full bg-foreground px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-background md:inline-flex">
                                Vos
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {entry.headline || `${entry.enrolledCourses} ${entry.enrolledCourses === 1 ? "curso" : "cursos"}`}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs font-bold">
                          <span className="md:hidden">Progreso</span>
                          <span>{entry.overallProgress}%</span>
                        </div>
                        <Progress value={entry.overallProgress} className="h-2 bg-muted" />
                      </div>
                      <div className="flex gap-5 text-xs md:block">
                        <p className="flex items-center gap-1.5 font-extrabold">
                          <BookOpenCheck className="h-4 w-4 text-accent" />
                          {entry.completedLessons} lecciones
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-muted-foreground md:ml-5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {entry.completedCourses} {entry.completedCourses === 1 ? "curso" : "cursos"}
                        </p>
                      </div>
                      <ArrowRight className="hidden h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground md:block" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[26px] border border-dashed border-foreground/20 bg-card p-10 text-center">
          <Trophy className="mx-auto h-9 w-9 text-accent" />
          <h2 className="mt-5 text-xl font-extrabold">El ranking empieza con la primera inscripción.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Cuando haya cursos adquiridos, el progreso aparecerá automáticamente.
          </p>
        </section>
      )}
    </div>
  );
}
