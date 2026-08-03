import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { getCurrentUserId } from "@/lib/session";

import { Categories } from "./_components/categories";

interface SearchPageProps {
  searchParams: Promise<{
    title?: string;
    categoryId?: string;
  }>;
};

const SearchPage = async ({
  searchParams
}: SearchPageProps) => {
  const query = await searchParams;
  const userId = await getCurrentUserId();

  if (!userId) {
    return redirect("/sign-in");
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc"
    }
  });

  const courses = await getCourses({
    userId,
    ...query,
  });

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="mx-auto max-w-7xl space-y-7 p-5 md:p-8 lg:p-10">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">Catálogo</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Elegí tu próximo producto</h1>
        </div>
        <Categories
          items={categories}
        />
        <CoursesList items={courses} emptyState="No encontramos cursos con esos filtros." />
      </div>
    </>
   );
}
 
export default SearchPage;
