import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { IconBadge } from "@/components/icon-badge";
import { formatPrice, PriceValue } from "@/lib/format";
import { CourseProgress } from "@/components/course-progress";

interface CourseCardProps {
  id: string;
  firstChapterId?: string;
  nextChapterId?: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: PriceValue;
  progress: number | null;
  category: string;
};

export const CourseCard = ({
  id,
  firstChapterId,
  nextChapterId,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category
}: CourseCardProps) => {
  const chapterId = nextChapterId || firstChapterId;
  const href =
    progress !== null && chapterId
      ? `/cursos/${id}/capitulos/${chapterId}`
      : `/cursos/${id}`;

  return (
    <Link href={href}>
      <div className="group h-full overflow-hidden rounded-[22px] border border-foreground/10 bg-card p-3 transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(30,24,20,0.10)]">
        <div className="relative aspect-video w-full overflow-hidden rounded-[16px] bg-foreground">
          <Image
            fill
            sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
            alt={title}
            src={imageUrl || "/thiings/kiwi.png"}
          />
        </div>
        <div className="flex flex-col pt-2">
          <div className="line-clamp-2 text-lg font-extrabold tracking-[-0.025em] transition group-hover:text-accent md:text-base">
            {title}
          </div>
          <p className="text-xs text-muted-foreground">
            {category || "IA y producto"}
          </p>
          <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-muted-foreground">
              <IconBadge size="sm" icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? "lección" : "lecciones"}
              </span>
            </div>
          </div>
          {progress !== null ? (
            <CourseProgress
              variant={progress === 100 ? "success" : "default"}
              size="sm"
              value={progress}
            />
          ) : (
            <p className="text-md font-extrabold md:text-sm">
              {formatPrice(price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
