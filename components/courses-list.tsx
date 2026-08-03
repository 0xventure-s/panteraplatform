import type { CourseListItem } from "@/actions/get-courses";
import { CourseCard } from "@/components/course-card";

interface CoursesListProps {
  items: CourseListItem[];
  emptyState?: string;
}

export const CoursesList = ({
  items,
  emptyState = "No encontramos cursos con esos filtros.",
}: CoursesListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <CourseCard
            key={item.id}
            id={item.id}
            firstChapterId={item.chapters[0]?.id}
            nextChapterId={item.nextChapterId}
            title={item.title}
            imageUrl={item.imageUrl!}
            chaptersLength={item.chapters.length}
            price={item.price!}
            progress={item.progress}
            category={item?.category?.name!}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-foreground/20 p-8 text-center text-sm text-muted-foreground">
          {emptyState}
        </div>
      )}
    </div>
  )
}
