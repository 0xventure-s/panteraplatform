import Image from "next/image";
import { Sparkles } from "lucide-react";

import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { SearchInput } from "@/components/search-input";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

import { Categories } from "./_components/categories";

interface SearchPageProps {
  searchParams: Promise<{
    title?: string;
    categoryId?: string;
  }>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const [query, userId] = await Promise.all([
    searchParams,
    getCurrentUserId(),
  ]);
  const [categories, courses] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getCourses({
      userId,
      ...query,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-4 sm:p-6 md:p-8 lg:p-10">
      <section className="relative isolate min-h-[300px] overflow-hidden rounded-[28px] bg-foreground text-background shadow-[0_24px_70px_rgba(22,18,15,0.2)] sm:min-h-[320px] lg:min-h-[340px] lg:rounded-[36px]">
        <Image
          src="/ai-learning-hero.png"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) calc(100vw - 18rem), calc(100vw - 2rem)"
          className="object-cover object-[68%_center] sm:object-[62%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171411] via-[#171411]/90 to-[#171411]/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171411]/75 via-transparent to-transparent" />

        <div className="relative z-10 flex min-h-[300px] max-w-3xl flex-col justify-center px-6 py-10 sm:min-h-[320px] sm:px-10 lg:min-h-[340px] lg:px-14">

          <h1 className="font-display leading-[0.88] tracking-[-0.045em]">
            <span className="block text-[clamp(2.65rem,5.4vw,4.75rem)] sm:whitespace-nowrap">
              Aprende a construir
            </span>
            <span className="mt-1 block text-[clamp(3rem,5.8vw,5rem)] italic text-secondary">
              con IA.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-sm font-medium leading-6 text-background/72 sm:text-base sm:leading-7">
            Cursos prácticos para convertir ideas en productos, automatizaciones y agentes listos para poner en uso.
          </p>
        </div>
      </section>

      <section className="space-y-6 pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
              Catálogo
            </p>
            <h2 className="mt-2 font-display text-4xl leading-none tracking-[-0.035em] sm:text-5xl">
              Elige qué construir.
            </h2>
          </div>
          <div className="w-full sm:max-w-sm md:hidden">
            <SearchInput />
          </div>
        </div>

        <Categories items={categories} />
        <CoursesList items={courses} emptyState="No encontramos cursos con esos filtros." />
      </section>
    </div>
  );
};

export default SearchPage;
