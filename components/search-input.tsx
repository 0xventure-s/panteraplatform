"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useEffect, useId, useRef, useState } from "react";

import { ThreeDIcon } from "@/components/three-d-icon";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

type CourseSuggestion = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  category: string | null;
};

export const SearchInput = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentTitle = searchParams.get("title") || "";
  const currentCategoryId = searchParams.get("categoryId");

  const [value, setValue] = useState(currentTitle);
  const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionListId = `course-search-${useId().replace(/:/g, "")}`;
  const debouncedValue = useDebounce(value, 250);
  const normalizedQuery = debouncedValue.trim();
  const isOpen = isFocused && value.trim().length > 0;
  const isPending = isLoading || value.trim() !== normalizedQuery;

  useEffect(() => {
    setValue(currentTitle);
  }, [currentTitle]);

  useEffect(() => {
    if (!normalizedQuery || !isFocused) {
      if (!normalizedQuery) {
        setSuggestions([]);
      }
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadSuggestions = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/courses/suggestions?q=${encodeURIComponent(normalizedQuery)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar las sugerencias");
        }

        const data = (await response.json()) as CourseSuggestion[];
        setSuggestions(data);
        setActiveIndex(-1);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadSuggestions();

    return () => controller.abort();
  }, [normalizedQuery, isFocused]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const openCourse = (courseId: string) => {
    setIsFocused(false);
    router.push(`/cursos/${courseId}`);
  };

  const viewAllResults = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          categoryId: currentCategoryId,
          title: value.trim(),
        },
      },
      { skipEmptyString: true, skipNull: true },
    );

    setIsFocused(false);
    router.push(url);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsFocused(false);
      return;
    }

    if (!isOpen) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (activeIndex >= 0 && suggestions[activeIndex]) {
        openCourse(suggestions[activeIndex].id);
        return;
      }

      viewAllResults();
      return;
    }

    if (suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current >= suggestions.length - 1 ? 0 : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      );
    }

  };

  return (
    <div ref={containerRef} className="relative w-full md:w-[320px]">
      <span className="pointer-events-none absolute left-2 top-[22px] z-10 grid h-8 w-8 -translate-y-1/2 place-items-center">
        <ThreeDIcon name="zoom" size={25} />
      </span>
      <Input
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 && suggestions[activeIndex]
            ? `${suggestionListId}-${suggestions[activeIndex]?.id}`
            : undefined
        }
        aria-controls={suggestionListId}
        aria-expanded={isOpen}
        aria-label="Buscar un curso"
        autoComplete="off"
        onChange={(event) => {
          setValue(event.target.value);
          setIsFocused(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        value={value}
        className="h-11 w-full rounded-full border-foreground/10 bg-card pl-11 pr-4 shadow-sm transition-shadow focus-visible:shadow-[0_10px_30px_rgba(30,24,20,0.10)]"
        placeholder="Buscar un curso"
      />

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[20px] border border-foreground/10 bg-card p-2 shadow-[0_24px_65px_rgba(30,24,20,0.18)]"
        >
          <div className="flex items-center justify-between px-3 pb-2 pt-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              Cursos sugeridos
            </p>
            {isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
            )}
          </div>

          <div id={suggestionListId} role="listbox" className="space-y-1">
            {!isPending && suggestions.length === 0 ? (
              <p
                role="option"
                aria-disabled="true"
                aria-selected="false"
                className="px-3 py-5 text-sm text-muted-foreground"
              >
                No encontramos cursos parecidos.
              </p>
            ) : (
              suggestions.map((course, index) => (
                <button
                  key={course.id}
                  id={`${suggestionListId}-${course.id}`}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openCourse(course.id)}
                  className="group flex w-full items-center gap-3 rounded-[14px] p-2 text-left transition hover:bg-foreground/[0.045] focus-visible:bg-foreground/[0.045] focus-visible:outline-none aria-selected:bg-foreground/[0.06]"
                >
                  <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-[10px] bg-foreground/5">
                    <Image
                      src={course.imageUrl || "/thiings/kiwi.png"}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold tracking-[-0.015em]">
                      {course.title}
                    </span>
                    {(course.category || course.subtitle) && (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {course.category || course.subtitle}
                      </span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={viewAllResults}
            className="mt-2 flex w-full items-center justify-between border-t border-foreground/10 px-3 pb-1 pt-3 text-left text-xs font-bold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          >
            Ver todos los resultados
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
