import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  GraduationCap,
  Layers,
  Lock,
  PlayCircle,
  Star,
  Target,
  X,
} from "lucide-react";

import { CourseEnrollButton } from "@/app/(course)/courses/[courseId]/chapters/[chapterId]/_components/course-enroll-button";
import { ProfileAvatar } from "@/components/community/profile-avatar";
import { CourseTile } from "@/components/marketing/course-tile";
import { Preview } from "@/components/preview";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { db } from "@/lib/db";
import { formatPrice, toPriceNumber } from "@/lib/format";
import { getCurrentUserId } from "@/lib/session";

import { CourseReviewForm } from "./_components/course-review-form";
import { CourseTrailer } from "./_components/course-trailer";
import { LessonPreview } from "./_components/lesson-preview";

const getPublicCourse = unstable_cache(
  async (courseId: string) => {
    const course = await db.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      subtitle: true,
      description: true,
      imageUrl: true,
      price: true,
      level: true,
      estimatedMinutes: true,
      outcomes: true,
      targetAudience: true,
      notForAudience: true,
      prerequisites: true,
      projectTitle: true,
      projectDescription: true,
      projectImageUrl: true,
      categoryId: true,
      category: {
        select: { name: true },
      },
      attachments: {
        select: { id: true },
      },
      chapters: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          description: true,
          moduleTitle: true,
          durationMinutes: true,
          isFree: true,
          isTrailer: true,
          muxData: {
            select: { playbackId: true },
          },
        },
        orderBy: { position: "asc" },
      },
      faqs: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          question: true,
          answer: true,
        },
      },
      reviews: {
        select: {
          id: true,
          userId: true,
          rating: true,
          comment: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
    });

    return course
      ? {
          ...course,
          price: course.price?.toString() ?? null,
        }
      : null;
  },
  ["public-course-v2"],
  { revalidate: 30, tags: ["courses"] },
);

const recommendedCourseSelect = {
  id: true,
  title: true,
  subtitle: true,
  description: true,
  imageUrl: true,
  price: true,
  category: {
    select: { name: true },
  },
  chapters: {
    where: { isPublished: true },
    select: { id: true },
  },
} as const;

const getRecommendedCourses = unstable_cache(
  async (courseId: string, categoryId?: string | null) => {
    const [relatedCourses, recentCourses] = await Promise.all([
      categoryId
        ? db.course.findMany({
          where: {
            id: { not: courseId },
            categoryId,
            isPublished: true,
          },
          select: recommendedCourseSelect,
          orderBy: { createdAt: "desc" },
          take: 3,
        })
        : Promise.resolve([]),
      db.course.findMany({
      where: {
        id: { not: courseId },
        isPublished: true,
      },
      select: recommendedCourseSelect,
      orderBy: { createdAt: "desc" },
      take: 3,
      }),
    ]);

    return [...relatedCourses, ...recentCourses]
      .filter(
        (course, index, courses) =>
          courses.findIndex((candidate) => candidate.id === course.id) === index,
      )
      .slice(0, 3)
      .map((course) => ({
        ...course,
        price: course.price?.toString() ?? null,
      }));
  },
  ["recommended-courses-v2"],
  { revalidate: 60, tags: ["courses"] },
);

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatDuration = (minutes?: number | null) => {
  if (!minutes) return null;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) return `${minutes} min`;
  if (!remainingMinutes) return `${hours} h`;
  return `${hours} h ${remainingMinutes} min`;
};

interface PurchaseActionProps {
  courseId: string;
  firstChapterId?: string;
  hasAccess: boolean;
  isSignedIn: boolean;
  price?: number | null;
}

const PurchaseAction = ({
  courseId,
  firstChapterId,
  hasAccess,
  isSignedIn,
  price,
}: PurchaseActionProps) => {
  if (hasAccess && firstChapterId) {
    return (
      <Button
        asChild
        className="h-12 w-full rounded-full bg-secondary font-extrabold text-foreground hover:bg-secondary/90"
        size="lg"
      >
        <Link href={`/cursos/${courseId}/capitulos/${firstChapterId}`}>
          Continuar curso
        </Link>
      </Button>
    );
  }

  if (hasAccess) {
    return (
      <Button className="h-12 w-full rounded-full" disabled size="lg">
        Contenido en preparación
      </Button>
    );
  }

  if (!price) {
    return (
      <Button className="h-12 w-full rounded-full" disabled size="lg">
        Inscripciones próximamente
      </Button>
    );
  }

  if (isSignedIn) {
    return <CourseEnrollButton courseId={courseId} price={price} />;
  }

  return (
    <Button
      asChild
      className="h-12 w-full rounded-full bg-secondary font-extrabold text-foreground hover:bg-secondary/90"
      size="lg"
    >
      <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/cursos/${courseId}`)}`}>
        Ingresar para inscribirme
      </Link>
    </Button>
  );
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getPublicCourse(courseId);

  if (!course) {
    return { title: "Curso no encontrado" };
  }

  const description =
    course.subtitle ||
    (course.description ? stripHtml(course.description).slice(0, 155) : undefined);

  return {
    title: course.title,
    description,
    openGraph: {
      title: course.title,
      description,
      type: "website",
      images: course.imageUrl ? [{ url: course.imageUrl, alt: course.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
      images: course.imageUrl ? [course.imageUrl] : undefined,
    },
  };
}

export default async function PublicCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const [course, userId] = await Promise.all([
    getPublicCourse(courseId),
    getCurrentUserId(),
  ]);

  if (!course) {
    notFound();
  }

  const [instructor, recommendedCourses, purchase] = await Promise.all([
    db.user.findUnique({
      where: { id: course.userId },
      select: {
        name: true,
        image: true,
        headline: true,
        bio: true,
      },
    }),
    getRecommendedCourses(course.id, course.categoryId),
    userId
      ? db.purchase.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: course.id,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  const hasAccess = Boolean(purchase);
  const firstChapter = course.chapters[0];
  const trailerChapter =
    course.chapters.find(
      (chapter) => chapter.isTrailer && chapter.muxData?.playbackId,
    ) ||
    course.chapters.find(
      (chapter) => chapter.isFree && chapter.muxData?.playbackId,
    );
  const chapterMinutes = course.chapters.reduce(
    (total, chapter) => total + (chapter.durationMinutes || 0),
    0,
  );
  const totalMinutes = course.estimatedMinutes || chapterMinutes || null;
  const currentReview = userId
    ? course.reviews.find((review) => review.userId === userId)
    : null;
  const ratingAverage = course.reviews.length
    ? course.reviews.reduce((total, review) => total + review.rating, 0) /
      course.reviews.length
    : null;
  const price = course.price ? toPriceNumber(course.price) : null;

  const modules = course.chapters.reduce<
    Array<{ title: string; lessons: typeof course.chapters }>
  >((groups, chapter) => {
    const moduleTitle = chapter.moduleTitle || "Programa del curso";
    const currentGroup = groups.find((group) => group.title === moduleTitle);

    if (currentGroup) {
      currentGroup.lessons.push(chapter);
    } else {
      groups.push({ title: moduleTitle, lessons: [chapter] });
    }

    return groups;
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description:
      course.subtitle ||
      (course.description ? stripHtml(course.description).slice(0, 300) : undefined),
    provider: {
      "@type": "Organization",
      name: "Pantera",
    },
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: "ARS",
          availability: "https://schema.org/InStock",
        }
      : undefined,
    aggregateRating: ratingAverage
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(ratingAverage.toFixed(1)),
          ratingCount: course.reviews.length,
        }
      : undefined,
  };

  return (
    <main className="pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className="relative isolate overflow-hidden bg-[#0d0b09] text-[#f8f4ea]">
        <div className="absolute -inset-20" aria-hidden="true">
          <Image
            src="/ai-learning-hero-v2.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-125 object-cover object-center brightness-[0.78] saturate-[1.28] blur-[52px]"
          />
        </div>
        <div className="absolute -inset-8 opacity-20" aria-hidden="true">
          <Image
            src="/ai-learning-hero-v2.png"
            alt=""
            fill
            sizes="100vw"
            className="scale-110 object-cover object-center saturate-[1.12] blur-[16px]"
          />
        </div>
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,7,0.88)_0%,rgba(10,8,7,0.62)_48%,rgba(10,8,7,0.28)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0d0b09]/70 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:py-24">
          <div className="lg:pr-10">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Todos los cursos
            </Link>
            {course.category && (
              <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">
                {course.category.name}
              </p>
            )}
            <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.92] tracking-[-0.045em] sm:text-6xl md:text-7xl">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
                {course.subtitle}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-white/65">
              {course.level && (
                <span className="inline-flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-secondary" />
                  {course.level}
                </span>
              )}
              {totalMinutes && (
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-secondary" />
                  {formatDuration(totalMinutes)}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-secondary" />
                {course.chapters.length} {course.chapters.length === 1 ? "lección" : "lecciones"}
              </span>
              {ratingAverage && (
                <span className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  {ratingAverage.toFixed(1)} · {course.reviews.length} {course.reviews.length === 1 ? "opinión" : "opiniones"}
                </span>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[22px] border border-white/20 bg-black/75 p-1 shadow-[0_30px_80px_rgba(0,0,0,0.48)] backdrop-blur-sm">
            <CourseTrailer
              playbackId={trailerChapter?.muxData?.playbackId}
              posterUrl={course.imageUrl}
              title={course.title}
            />
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-xs font-bold text-white/60">
              <span>Tráiler del curso</span>
              {trailerChapter?.durationMinutes && (
                <span>{formatDuration(trailerChapter.durationMinutes)}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <nav className="sticky top-[76px] z-30 hidden border-b border-foreground/10 bg-background/90 backdrop-blur-xl lg:block">
        <div className="mx-auto flex max-w-7xl gap-7 px-8 py-4 text-sm font-bold text-muted-foreground">
          {course.outcomes.length > 0 && <a href="#resultados" className="hover:text-foreground">Resultados</a>}
          {course.projectTitle && <a href="#proyecto" className="hover:text-foreground">Proyecto final</a>}
          <a href="#programa" className="hover:text-foreground">Programa</a>
          {instructor && <a href="#docente" className="hover:text-foreground">Docente</a>}
          {course.reviews.length > 0 && <a href="#opiniones" className="hover:text-foreground">Opiniones</a>}
          {course.faqs.length > 0 && <a href="#preguntas" className="hover:text-foreground">Preguntas</a>}
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-20">
        <div className="min-w-0 space-y-20">
          {course.outcomes.length > 0 && (
            <section id="resultados" className="scroll-mt-40">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
                Tu punto de llegada
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] tracking-[-0.04em]">
                Lo que vas a poder hacer.
              </h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((outcome, index) => (
                  <div
                    key={outcome}
                    className="group rounded-[24px] border border-foreground/10 bg-card p-5 transition hover:-translate-y-0.5 hover:border-foreground/20"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-extrabold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-5 text-base font-bold leading-7">{outcome}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {course.projectTitle && (
            <section
              id="proyecto"
              className="scroll-mt-40 overflow-hidden rounded-[34px] bg-[#17130f] text-[#f8f4ea]"
            >
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="p-7 sm:p-10">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">
                    Proyecto final
                  </p>
                  <h2 className="mt-5 font-display text-5xl leading-[0.95] tracking-[-0.04em]">
                    {course.projectTitle}
                  </h2>
                  {course.projectDescription && (
                    <p className="mt-6 text-base leading-8 text-white/65">
                      {course.projectDescription}
                    </p>
                  )}
                </div>
                {course.projectImageUrl ? (
                  <div className="relative min-h-72 overflow-hidden bg-white/5 lg:min-h-full">
                    <Image
                      src={course.projectImageUrl}
                      alt={course.projectTitle}
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative grid min-h-64 place-items-center overflow-hidden bg-secondary text-foreground">
                    <span className="absolute -bottom-3 -right-2 font-display text-7xl leading-none tracking-[-0.06em] text-foreground/10 sm:text-8xl">
                      HACER
                    </span>
                    <Target className="relative h-16 w-16" />
                  </div>
                )}
              </div>
            </section>
          )}

          {course.description && (
            <section>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
                El recorrido
              </p>
              <div className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
                <Preview value={course.description} />
              </div>
            </section>
          )}

          <section id="programa" className="scroll-mt-40">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
                  Programa
                </p>
                <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.04em]">
                  Del primer paso al resultado.
                </h2>
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                {modules.length} {modules.length === 1 ? "módulo" : "módulos"} · {course.chapters.length} {course.chapters.length === 1 ? "lección" : "lecciones"}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {modules.map((module, moduleIndex) => {
                const moduleMinutes = module.lessons.reduce(
                  (total, lesson) => total + (lesson.durationMinutes || 0),
                  0,
                );

                return (
                  <details
                    key={module.title}
                    className="group overflow-hidden rounded-[24px] border border-foreground/10 bg-card"
                    open={moduleIndex === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground font-extrabold text-background">
                        {String(moduleIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold">{module.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {module.lessons.length} {module.lessons.length === 1 ? "lección" : "lecciones"}
                          {moduleMinutes ? ` · ${formatDuration(moduleMinutes)}` : ""}
                        </p>
                      </div>
                      <span className="text-2xl leading-none transition group-open:rotate-45">+</span>
                    </summary>
                    <div className="border-t border-foreground/10 px-5 py-2 sm:px-6">
                      {module.lessons.map((chapter, lessonIndex) => {
                        const previewAvailable = Boolean(
                          chapter.isFree && chapter.muxData?.playbackId,
                        );
                        const description = chapter.description
                          ? stripHtml(chapter.description)
                          : null;

                        return (
                          <div
                            key={chapter.id}
                            className="flex gap-4 border-b border-foreground/10 py-4 last:border-b-0"
                          >
                            <span className="pt-0.5 text-xs font-extrabold text-muted-foreground">
                              {String(lessonIndex + 1).padStart(2, "0")}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold">{chapter.title}</p>
                              {description && (
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                  {description}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              {chapter.durationMinutes && (
                                <span className="text-xs font-bold text-muted-foreground">
                                  {formatDuration(chapter.durationMinutes)}
                                </span>
                              )}
                              {previewAvailable ? (
                                <LessonPreview
                                  playbackId={chapter.muxData!.playbackId!}
                                  title={chapter.title}
                                />
                              ) : hasAccess ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>

          {(course.targetAudience.length > 0 ||
            course.notForAudience.length > 0 ||
            course.prerequisites.length > 0) && (
            <section className="grid gap-4 md:grid-cols-2">
              {course.targetAudience.length > 0 && (
                <div className="rounded-[28px] border border-foreground/10 bg-card p-6">
                  <h2 className="font-display text-3xl leading-none">Es para vos si...</h2>
                  <ul className="mt-6 space-y-4">
                    {course.targetAudience.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {course.notForAudience.length > 0 && (
                <div className="rounded-[28px] border border-foreground/10 bg-muted p-6">
                  <h2 className="font-display text-3xl leading-none">No es para vos si...</h2>
                  <ul className="mt-6 space-y-4">
                    {course.notForAudience.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6">
                        <X className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {course.prerequisites.length > 0 && (
                <div className="rounded-[28px] border border-foreground/10 bg-card p-6 md:col-span-2">
                  <h2 className="font-display text-3xl leading-none">Qué necesitás para empezar</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {course.prerequisites.map((item) => (
                      <div key={item} className="flex gap-3 rounded-2xl bg-muted p-4 text-sm leading-6">
                        <Check className="mt-0.5 h-5 w-5 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {instructor && (
            <section id="docente" className="scroll-mt-40 rounded-[34px] border border-foreground/10 bg-card p-6 sm:p-9">
              <div className="grid items-center gap-7 sm:grid-cols-[140px_1fr]">
                <ProfileAvatar
                  userId={course.userId}
                  name={instructor.name}
                  image={instructor.image}
                  className="aspect-square w-full text-4xl"
                />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">Docente</p>
                  <h2 className="mt-3 font-display text-4xl leading-none">{instructor.name}</h2>
                  {instructor.headline && (
                    <p className="mt-3 font-bold text-muted-foreground">{instructor.headline}</p>
                  )}
                  {instructor.bio && (
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{instructor.bio}</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {(course.reviews.length > 0 || hasAccess) && (
            <section id="opiniones" className="scroll-mt-40">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">Experiencias reales</p>
                  <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.04em]">Opiniones de alumnos.</h2>
                </div>
                {ratingAverage && (
                  <div className="flex items-center gap-2 text-xl font-extrabold">
                    <Star className="h-5 w-5 fill-secondary" />
                    {ratingAverage.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {course.reviews.map((review) => (
                  <article key={review.id} className="rounded-[26px] border border-foreground/10 bg-card p-6">
                    <div className="flex gap-1" aria-label={`${review.rating} de 5 estrellas`}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`h-4 w-4 ${value <= review.rating ? "fill-secondary text-foreground" : "text-foreground/15"}`}
                        />
                      ))}
                    </div>
                    <p className="mt-5 text-sm leading-7">“{review.comment}”</p>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-muted text-xs font-extrabold">
                        {review.user.image ? (
                          <div
                            aria-hidden="true"
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${review.user.image})` }}
                          />
                        ) : (
                          review.user.name.slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{review.user.name}</p>
                        <p className="text-xs text-muted-foreground">Compra verificada</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {hasAccess && (
                <div className="mt-5">
                  <CourseReviewForm
                    courseId={course.id}
                    initialReview={currentReview}
                  />
                </div>
              )}
            </section>
          )}

          {course.faqs.length > 0 && (
            <section id="preguntas" className="scroll-mt-40">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">Antes de empezar</p>
              <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.04em]">Preguntas frecuentes.</h2>
              <div className="mt-8 divide-y divide-foreground/10 border-y border-foreground/10">
                {course.faqs.map((faq) => (
                  <details key={faq.id} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold">
                      {faq.question}
                      <span className="text-2xl leading-none transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="max-w-3xl pt-4 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-40 rounded-[30px] border border-foreground/10 bg-card p-6 shadow-[0_28px_80px_rgba(31,24,19,0.11)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
              {hasAccess ? "Tu curso" : "Inscripción"}
            </p>
            <p className="mt-3 text-3xl font-extrabold">
              {hasAccess ? "Ya tenés acceso" : price ? formatPrice(price) : "Próximamente"}
            </p>
            <div className="mt-5">
              <PurchaseAction
                courseId={course.id}
                firstChapterId={firstChapter?.id}
                hasAccess={hasAccess}
                isSignedIn={Boolean(userId)}
                price={price}
              />
            </div>
            <div className="mt-6 space-y-3 border-t border-foreground/10 pt-5 text-sm">
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-accent" />
                {course.chapters.length} {course.chapters.length === 1 ? "lección" : "lecciones"}
              </div>
              {totalMinutes && (
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-accent" />
                  {formatDuration(totalMinutes)} de trabajo estimado
                </div>
              )}
              {course.attachments.length > 0 && (
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-accent" />
                  {course.attachments.length} {course.attachments.length === 1 ? "recurso descargable" : "recursos descargables"}
                </div>
              )}
              {course.projectTitle && (
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-accent" />
                  Proyecto final incluido
                </div>
              )}
            </div>
            <WhatsAppButton className="mt-5 w-full bg-transparent text-foreground shadow-none ring-1 ring-foreground/15 hover:bg-muted" />
          </div>
        </aside>
      </div>

      {recommendedCourses.length > 0 && (
        <section className="border-t border-foreground/10 bg-card/45">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
              Seguí aprendiendo
            </p>
            <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.04em]">
              Otros cursos recomendados.
            </h2>
            <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.map((recommendedCourse) => (
                <CourseTile
                  key={recommendedCourse.id}
                  id={recommendedCourse.id}
                  title={recommendedCourse.title}
                  description={
                    recommendedCourse.subtitle || recommendedCourse.description
                  }
                  imageUrl={recommendedCourse.imageUrl}
                  price={recommendedCourse.price}
                  category={recommendedCourse.category?.name}
                  chaptersLength={recommendedCourse.chapters.length}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-foreground/10 bg-background/95 p-3 shadow-[0_-16px_50px_rgba(31,24,19,0.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-muted-foreground">{course.title}</p>
            <p className="font-extrabold">
              {hasAccess ? "Ya tenés acceso" : price ? formatPrice(price) : "Próximamente"}
            </p>
          </div>
          <div className="min-w-[190px]">
            <PurchaseAction
              courseId={course.id}
              firstChapterId={firstChapter?.id}
              hasAccess={hasAccess}
              isSignedIn={Boolean(userId)}
              price={price}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
