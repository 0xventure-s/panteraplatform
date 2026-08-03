"use client";

import qs from "query-string";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { ThreeDIcon } from "@/components/three-d-icon";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchInput = () => {
  const [value, setValue] = useState("")
  const debouncedValue = useDebounce(value);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    const url = qs.stringifyUrl({
      url: pathname,
      query: {
        categoryId: currentCategoryId,
        title: debouncedValue,
      }
    }, { skipEmptyString: true, skipNull: true });

    router.push(url);
  }, [debouncedValue, currentCategoryId, router, pathname])

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center">
        <ThreeDIcon name="zoom" size={25} />
      </span>
      <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="h-11 w-full rounded-full border-foreground/10 bg-card pl-11 md:w-[320px]"
        placeholder="Buscar un curso"
      />
    </div>
  );
};
