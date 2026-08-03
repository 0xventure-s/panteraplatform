import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Link2,
  MapPin,
  Medal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProfileAvatar } from "@/components/community/profile-avatar";
import { ProfileEditor } from "@/components/community/profile-editor";
import { ThreeDIcon } from "@/components/three-d-icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CommunityProfile } from "@/lib/community";

interface ProfileViewProps {
  profile: CommunityProfile;
  canEdit: boolean;
  rank?: number;
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
});

export const ProfileView = ({ profile, canEdit, rank }: ProfileViewProps) => (
  <div className="mx-auto max-w-7xl space-y-8 p-5 md:p-8 lg:p-10">
    <div className="flex items-center justify-between gap-4">
      <Button asChild variant="ghost" className="rounded-full px-3">
        <Link href="/ranking">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al ranking
        </Link>
      </Button>
      {!canEdit && (
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/perfil">Mi perfil</Link>
        </Button>
      )}
    </div>

    <section className="relative isolate overflow-hidden rounded-[32px] bg-foreground text-background ">
      <Image
        src="/profile-banner.png"
        alt=""
        fill
        priority
        sizes="(min-width: 768px) calc(100vw - 19rem), calc(100vw - 2.5rem)"
        className="object-cover object-[72%_center] sm:object-[68%_center] lg:object-center"
      />
      

      <div className=" relative p-7 md:p-10 lg:p-12">
        <div className="absolute right-8 top-8 hidden font-display text-[150px] leading-none text-background/[0.035] lg:block">
          {rank ? String(rank).padStart(2, "0") : "//"}
        </div>
        <div className="relative flex flex-col gap-7 md:flex-row md:items-end">
          <ProfileAvatar
            userId={profile.id}
            name={profile.name}
            image={profile.image}
            className="h-28 w-28 text-3xl md:h-36 md:w-36 md:text-4xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {rank && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-background/15 bg-background/10 px-3 py-1 text-xs font-extrabold text-secondary">
                  <Medal className="h-3.5 w-3.5" />
                  Puesto {rank}
                </span>
              )}
              <span className="rounded-full border border-background/15 px-3 py-1 text-xs font-bold text-background/65">
                Desde {dateFormatter.format(profile.memberSince)}
              </span>
            </div>
            <h1 className="mt-4 font-display text-5xl leading-none tracking-[-0.04em] md:text-7xl">
              {profile.name}
            </h1>
            {profile.headline && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-background/70 md:text-lg">
                {profile.headline}
              </p>
            )}
            {profile.location && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-background/55">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {([
        {
          value: profile.stats.completedLessons,
          label: "Lecciones completadas",
          icon: "tick",
        },
        {
          value: profile.stats.completedCourses,
          label: "Cursos terminados",
          icon: "notebook",
        },
        {
          value: profile.stats.enrolledCourses,
          label: "Cursos adquiridos",
          icon: "credit-card",
        },
        {
          value: `${profile.stats.overallProgress}%`,
          label: "Progreso total",
          icon: "chart",
        },
      ] as const).map((stat) => (
        <div
          key={stat.label}
          className="flex items-center justify-between gap-4 rounded-[22px] border border-foreground/10 bg-card p-5"
        >
          <div>
            <p className="font-display text-4xl leading-none">{stat.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
          <span className="grid h-14 w-14 shrink-0 place-items-center">
            <ThreeDIcon name={stat.icon} size={47} />
          </span>
        </div>
      ))}
    </section>

    <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="space-y-8">
        <section className="rounded-[26px] border border-foreground/10 bg-card p-6 md:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
            Perfil
          </p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em]">
            Sobre {profile.name.split(" ")[0]}
          </h2>
          {profile.bio ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {profile.bio}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {canEdit
                ? "Completá tu presentación para que otros estudiantes conozcan tus intereses y proyectos."
                : "Todavía no agregó una presentación."}
            </p>
          )}
        </section>

        <section className="rounded-[26px] border border-foreground/10 bg-card p-6 md:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
              <Link2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                Trabajo publicado
              </p>
              <h2 className="font-extrabold">Proyectos y enlaces</h2>
            </div>
          </div>
          {profile.links.length > 0 ? (
            <div className="mt-5 space-y-2">
              {profile.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-xl border border-foreground/10 px-4 py-3 text-sm font-bold transition hover:border-foreground/30 hover:bg-muted"
                >
                  <span className="truncate">{link.label}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              {canEdit
                ? "Agregá repositorios, demos o redes profesionales desde la edición de tu perfil."
                : "Todavía no publicó enlaces."}
            </p>
          )}
        </section>
      </div>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
              Recorrido
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
              Cursos adquiridos
            </h2>
          </div>
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>

        {profile.purchases.length > 0 ? (
          <div className="space-y-4">
            {profile.purchases.map((purchase) => (
              <Link
                key={purchase.id}
                href={`/cursos/${purchase.course.id}`}
                className="group grid gap-4 rounded-[24px] border border-foreground/10 bg-card p-3 transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(30,24,20,0.08)] sm:grid-cols-[150px_1fr]"
              >
                <div className="relative aspect-video overflow-hidden rounded-[17px] bg-foreground sm:aspect-auto sm:min-h-32">
                  {purchase.course.imageUrl ? (
                    <Image
                      src={purchase.course.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 150px, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="soft-noise grid h-full place-items-center font-display text-3xl text-background">
                      IA
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-col p-2 sm:py-3 sm:pr-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-accent">
                        {purchase.course.category || "Curso"}
                      </p>
                      <h3 className="mt-2 text-lg font-extrabold tracking-[-0.025em] group-hover:text-accent">
                        {purchase.course.title}
                      </h3>
                    </div>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-auto pt-5">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
                      <span className="text-muted-foreground">
                        {purchase.completedLessons} de {purchase.totalLessons} lecciones
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {purchase.progress === 100 && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                        {purchase.progress}%
                      </span>
                    </div>
                    <Progress
                      value={purchase.progress}
                      variant={purchase.progress === 100 ? "success" : "default"}
                      className="h-2 bg-muted"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-foreground/20 p-8 text-center text-sm text-muted-foreground">
            {canEdit
              ? "Tus cursos aparecerán cuando completes tu primera compra."
              : "Todavía no adquirió cursos."}
          </div>
        )}
      </section>
    </div>

    {canEdit && (
      <section className="rounded-[28px] border border-foreground/10 bg-card p-6 md:p-8 lg:p-10">
        <div className="mb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
            Tu identidad
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
            Editar perfil
          </h2>
        </div>
        <ProfileEditor profile={profile} />
      </section>
    )}
  </div>
);
