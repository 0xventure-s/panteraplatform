import { Category, Course } from "@prisma/client";

import { db } from "@/lib/db";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  nextChapterId?: string;
};

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
}

export const getDashboardCourses = async (userId: string): Promise<DashboardCourses> => {
  try {
    const purchasedCourses = await db.purchase.findMany({
      where: {
        userId: userId,
      },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: {
                isPublished: true,
              },
              orderBy: {
                position: "asc",
              },
              include: {
                userProgress: {
                  where: {
                    userId,
                  },
                  select: {
                    isCompleted: true,
                  },
                },
              },
            }
          }
        }
      }
    });

    const courses = purchasedCourses.map(({ course }) => {
      const completedChapters = course.chapters.filter(
        (chapter) => chapter.userProgress[0]?.isCompleted,
      ).length;
      const progress = course.chapters.length
        ? (completedChapters / course.chapters.length) * 100
        : 0;
      const nextChapter = course.chapters.find(
        (chapter) => !chapter.userProgress[0]?.isCompleted,
      );

      return {
        ...course,
        chapters: course.chapters.map(({ id }) => ({ id })),
        progress,
        nextChapterId: nextChapter?.id,
      };
    }) satisfies CourseWithProgressWithCategory[];

    const completedCourses = courses.filter((course) => course.progress === 100);
    const coursesInProgress = courses.filter((course) => (course.progress ?? 0) < 100);

    return {
      completedCourses,
      coursesInProgress,
    }
  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    }
  }
}
