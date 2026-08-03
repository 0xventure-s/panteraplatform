import { NextResponse } from "next/server";

import { db } from "@/lib/db";

const MAX_SUGGESTIONS = 6;
const MAX_CANDIDATES = 80;
const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=900";

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();

const getDistance = (source: string, target: string) => {
  const previous = Array.from({ length: target.length + 1 }, (_, index) => index);

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    const current = [sourceIndex];

    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitutionCost =
        source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;

      current[targetIndex] = Math.min(
        current[targetIndex - 1] + 1,
        previous[targetIndex] + 1,
        previous[targetIndex - 1] + substitutionCost,
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[target.length];
};

const getMatchScore = (
  query: string,
  course: {
    title: string;
    subtitle: string | null;
    category: { name: string } | null;
  },
) => {
  const title = normalizeText(course.title);
  const subtitle = normalizeText(course.subtitle || "");
  const category = normalizeText(course.category?.name || "");
  const searchable = `${title} ${subtitle} ${category}`;
  const queryWords = query.split(/\s+/).filter(Boolean);
  const searchableWords = searchable.split(/\s+/).filter(Boolean);
  let score = 0;

  if (title === query) score += 120;
  if (title.startsWith(query)) score += 90;
  if (title.includes(query)) score += 70;
  if (subtitle.includes(query)) score += 45;
  if (category.includes(query)) score += 35;

  queryWords.forEach((queryWord) => {
    if (searchableWords.some((word) => word.startsWith(queryWord))) {
      score += 24;
      return;
    }

    if (queryWord.length < 3) {
      return;
    }

    const closestDistance = searchableWords.reduce(
      (closest, word) => Math.min(closest, getDistance(queryWord, word)),
      Number.POSITIVE_INFINITY,
    );
    const allowedDistance =
      queryWord.length <= 4 ? 1 : queryWord.length <= 8 ? 2 : 3;

    if (closestDistance <= allowedDistance) {
      score += 16 - closestDistance * 4;
    }
  });

  return score;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = normalizeText(searchParams.get("q") || "").slice(0, 80);

  if (!query) {
    return NextResponse.json([], {
      headers: { "Cache-Control": CACHE_CONTROL },
    });
  }

  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: MAX_CANDIDATES,
    });

    const suggestions = courses
      .map((course) => ({
        course,
        score: getMatchScore(query, course),
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_SUGGESTIONS)
      .map(({ course }) => ({
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        imageUrl: course.imageUrl,
        category: course.category?.name || null,
      }));

    return NextResponse.json(suggestions, {
      headers: { "Cache-Control": CACHE_CONTROL },
    });
  } catch (error) {
    console.error("[COURSE_SUGGESTIONS]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
