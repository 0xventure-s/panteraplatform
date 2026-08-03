import { ArrowUpRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice, PriceValue } from "@/lib/format";

interface CourseTileProps {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: PriceValue | null;
  category?: string | null;
  chaptersLength: number;
}

export const CourseTile = ({
  id,
  title,
  description,
  imageUrl,
  price,
  category,
  chaptersLength,
}: CourseTileProps) => {
  return (
    <Link
      href={`/cursos/${id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-foreground/10 bg-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(30,24,20,0.12)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-foreground">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="soft-noise flex h-full items-end p-6 text-background">
            <span className="font-display text-4xl leading-none">IA</span>
          </div>
        )}
        {category && (
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-foreground backdrop-blur">
            {category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-4">
          <h3 className="text-xl font-extrabold leading-tight tracking-[-0.035em]">
            {title}
          </h3>
          <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
        {description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {description.replace(/<[^>]*>/g, "")}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            {chaptersLength} {chaptersLength === 1 ? "lección" : "lecciones"}
          </span>
          <span className="text-base font-extrabold">
            {price ? formatPrice(price) : "Próximamente"}
          </span>
        </div>
      </div>
    </Link>
  );
};
