import type { CourseListItem } from "@/actions/get-courses";
import { db } from "@/lib/db";

type DashboardCourses = {
  completedCourses: CourseListItem[];
  coursesInProgress: CourseListItem[];
};

export const getDashboardCourses = async (
  userId: string,
): Promise<DashboardCourses> => {
  try {
    const purchasedCourses = await db.purchase.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        course: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            price: true,
            category: {
              select: { name: true },
            },
            chapters: {
              where: { isPublished: true },
              orderBy: { position: "asc" },
              select: {
                id: true,
                userProgress: {
                  where: { userId, isCompleted: true },
                  select: { id: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    const courses: CourseListItem[] = purchasedCourses.map(({ course }) => {
      const completedChapters = course.chapters.filter(
        (chapter) => chapter.userProgress.length > 0,
      ).length;
      const progress = course.chapters.length
        ? (completedChapters / course.chapters.length) * 100
        : 0;
      const nextChapter = course.chapters.find(
        (chapter) => chapter.userProgress.length === 0,
      );

      return {
        id: course.id,
        title: course.title,
        imageUrl: course.imageUrl,
        price: course.price,
        category: course.category,
        chapters: course.chapters.map(({ id }) => ({ id })),
        progress,
        nextChapterId: nextChapter?.id,
      };
    });

    return {
      completedCourses: courses.filter((course) => course.progress === 100),
      coursesInProgress: courses.filter((course) => (course.progress ?? 0) < 100),
    };
  } catch (error) {
    console.error("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};
