import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import { CourseTile } from "@/components/marketing/course-tile";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Cursos",
  description: "Cursos de IA aplicados a la construcción de productos.",
};

const getPublicCourses = unstable_cache(
  async () => {
    const courses = await db.course.findMany({
      where: { isPublished: true },
      select: {
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
      },
      orderBy: { createdAt: "desc" },
    });

    return courses.map((course) => ({
      ...course,
      price: course.price?.toString() ?? null,
    }));
  },
  ["public-courses-v2"],
  { revalidate: 60, tags: ["courses"] },
);

export default async function CoursesPage() {
  const courses = await getPublicCourses();

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
        Catálogo
      </p>
      <h1 className="mt-4 max-w-4xl font-display text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl">
        Aprendé IA mientras construís algo real.
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
        Recorridos concretos para transformar una idea en un producto usable, medible y listo para seguir creciendo.
      </p>

      {courses.length > 0 ? (
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseTile
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              imageUrl={course.imageUrl}
              price={course.price}
              category={course.category?.name}
              chaptersLength={course.chapters.length}
            />
          ))}
        </div>
      ) : (
        <div className="mt-14 rounded-[32px] border border-dashed border-foreground/25 p-12 text-muted-foreground">
          El catálogo se está preparando.
        </div>
      )}
    </main>
  );
}
