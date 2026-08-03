import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export interface CourseListItem {
  id: string;
  title: string;
  imageUrl: string | null;
  price: Prisma.Decimal | null;
  category: { name: string } | null;
  chapters: { id: string }[];
  progress: number | null;
  nextChapterId?: string;
}

type GetCourses = {
  userId?: string | null;
  title?: string;
  categoryId?: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
}: GetCourses): Promise<CourseListItem[]> => {
  try {
    const viewerId = userId ?? "";
    const normalizedTitle = title?.trim();
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        ...(normalizedTitle
          ? { title: { contains: normalizedTitle, mode: "insensitive" } }
          : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        price: true,
        category: {
          select: { name: true },
        },
        purchases: {
          where: { userId: viewerId },
          select: { id: true },
          take: 1,
        },
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            userProgress: {
              where: {
                userId: viewerId,
                isCompleted: true,
              },
              select: { id: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return courses.map(({ chapters, purchases, ...course }) => {
      const hasAccess = purchases.length > 0;
      const completedChapters = hasAccess
        ? chapters.filter((chapter) => chapter.userProgress.length > 0).length
        : 0;

      return {
        ...course,
        chapters: chapters.map(({ id }) => ({ id })),
        progress: hasAccess
          ? chapters.length > 0
            ? (completedChapters / chapters.length) * 100
            : 0
          : null,
      };
    });
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return [];
  }
};
