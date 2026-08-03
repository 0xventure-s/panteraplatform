"use client";

import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ThreeDIcon, type ThreeDIconName } from "@/components/three-d-icon";
import { cn } from "@/lib/utils";

interface CategoryItemProps {
  label: string;
  value?: string;
  icon?: ThreeDIconName;
}

export const CategoryItem = ({
  label,
  value,
  icon: Icon,
}: CategoryItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategoryId = searchParams.get("categoryId");
  const currentTitle = searchParams.get("title");

  const isSelected = currentCategoryId === value;

  const onClick = () => {
    const url = qs.stringifyUrl({
      url: pathname,
      query: {
        title: currentTitle,
        categoryId: isSelected ? null : value,
      }
    }, { skipNull: true, skipEmptyString: true });

    router.push(url);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-full border border-foreground/10 bg-card py-1.5 pl-1.5 pr-4 text-sm font-bold text-muted-foreground transition hover:border-foreground/25 hover:bg-muted hover:text-foreground",
        isSelected && "border-foreground bg-foreground text-background hover:bg-foreground hover:text-background"
      )}
      type="button"
    >
      {Icon && (
        <span className="grid h-8 w-8 place-items-center">
          <ThreeDIcon name={Icon} size={25} />
        </span>
      )}
      <div className="truncate">
        {label}
      </div>
    </button>
  );
};
