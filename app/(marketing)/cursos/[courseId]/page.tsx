import { ArrowLeft, BookOpen, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseEnrollButton } from "@/app/(course)/courses/[courseId]/chapters/[chapterId]/_components/course-enroll-button";
import { Preview } from "@/components/preview";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { getCurrentUserId } from "@/lib/session";

export default async function PublicCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const userId = await getCurrentUserId();
  const course = await db.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      category: true,
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const purchase = userId
    ? await db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      })
    : null;
  const hasAccess = Boolean(purchase);
  const firstChapter = course.chapters[0];

  return (
    <main>
      <section className="border-b border-foreground/10 bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_0.8fr] lg:px-8 lg:py-24">
          <div>
            <Link href="/cursos" className="inline-flex items-center gap-2 text-sm font-bold text-background/65 hover:text-secondary">
              <ArrowLeft className="h-4 w-4" />
              Todos los cursos
            </Link>
            {course.category && (
              <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">
                {course.category.name}
              </p>
            )}
            <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl">
              {course.title}
            </h1>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-background/65">
              <span className="inline-flex items-center gap-2 rounded-full border border-background/20 px-4 py-2">
                <BookOpen className="h-4 w-4" />
                {course.chapters.length} lecciones
              </span>
              <span className="rounded-full border border-background/20 px-4 py-2">
                Acceso con tu cuenta
              </span>
            </div>
          </div>
          <div className="overflow-hidden rounded-[32px] border border-background/15 bg-background/5 p-3">
            <div className="relative aspect-video overflow-hidden rounded-[24px] bg-background/10">
              {course.imageUrl ? (
                <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
              ) : (
                <div className="soft-noise grid h-full place-items-center text-7xl font-display">IA</div>
              )}
            </div>
            <div className="p-5">
              <p className="text-3xl font-extrabold">
                {course.price ? formatPrice(course.price) : "Próximamente"}
              </p>
              <div className="mt-5">
                {hasAccess && firstChapter ? (
                  <Button asChild size="lg" className="h-12 w-full rounded-full bg-secondary text-foreground hover:bg-secondary/90">
                    <Link href={`/cursos/${course.id}/capitulos/${firstChapter.id}`}>
                      Continuar curso
                    </Link>
                  </Button>
                ) : userId && course.price ? (
                  <CourseEnrollButton courseId={course.id} price={course.price} />
                ) : (
                  <Button asChild size="lg" className="w-full rounded-full bg-secondary text-foreground hover:bg-secondary/90">
                    <Link href="/sign-in">Ingresar para comprar</Link>
                  </Button>
                )}
                <WhatsAppButton className="mt-3 w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1fr_0.75fr] lg:px-8">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
            Sobre el curso
          </p>
          <div className="mt-5 text-base leading-8 text-muted-foreground">
            {course.description ? (
              <Preview value={course.description} />
            ) : (
              <p>El contenido completo se publicará junto con la próxima edición.</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
            Programa
          </p>
          <div className="mt-5 space-y-3">
            {course.chapters.map((chapter, index) => (
              <div key={chapter.id} className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-card p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-sm font-extrabold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-bold">{chapter.title}</p>
                {chapter.isFree ? (
                  <PlayCircle className="ml-auto h-5 w-5 text-accent" />
                ) : hasAccess ? (
                  <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-600" />
                ) : (
                  <Lock className="ml-auto h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
