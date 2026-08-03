import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";

export interface LeaderboardEntry {
  id: string;
  name: string;
  image: string | null;
  headline: string | null;
  location: string | null;
  completedLessons: number;
  completedCourses: number;
  enrolledCourses: number;
  overallProgress: number;
  position: number;
}

export interface CommunityProfile {
  id: string;
  name: string;
  image: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  memberSince: Date;
  links: Array<{
    id: string;
    label: string;
    url: string;
  }>;
  stats: {
    completedLessons: number;
    completedCourses: number;
    enrolledCourses: number;
    overallProgress: number;
  };
  purchases: Array<{
    id: string;
    purchasedAt: Date;
    course: {
      id: string;
      title: string;
      imageUrl: string | null;
      category: string | null;
    };
    completedLessons: number;
    totalLessons: number;
    progress: number;
  }>;
}

const percentage = (completed: number, total: number) =>
  total > 0 ? Math.round((completed / total) * 100) : 0;

const loadLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const purchases = await db.purchase.findMany({
    select: {
      userId: true,
      courseId: true,
      course: {
        select: {
          chapters: {
            where: { isPublished: true },
            select: { id: true },
          },
        },
      },
    },
  });

  const userIds = Array.from(new Set(purchases.map((purchase) => purchase.userId)));

  if (userIds.length === 0) {
    return [];
  }

  const [users, completedProgress] = await Promise.all([
    db.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        image: true,
        headline: true,
        location: true,
      },
    }),
    db.userProgress.findMany({
      where: {
        userId: { in: userIds },
        isCompleted: true,
      },
      select: {
        userId: true,
        chapterId: true,
        chapter: {
          select: { courseId: true, isPublished: true },
        },
      },
    }),
  ]);

  const purchasesByUser = new Map<
    string,
    Array<(typeof purchases)[number]>
  >();

  for (const purchase of purchases) {
    const current = purchasesByUser.get(purchase.userId) ?? [];
    current.push(purchase);
    purchasesByUser.set(purchase.userId, current);
  }

  const progressByUser = new Map<
    string,
    Array<(typeof completedProgress)[number]>
  >();

  for (const progress of completedProgress) {
    if (!progress.chapter.isPublished) {
      continue;
    }

    const current = progressByUser.get(progress.userId) ?? [];
    current.push(progress);
    progressByUser.set(progress.userId, current);
  }

  const entries = users.map((user) => {
    const userPurchases = purchasesByUser.get(user.id) ?? [];
    const purchasedCourseIds = new Set(
      userPurchases.map((purchase) => purchase.courseId),
    );
    const completedRows = (progressByUser.get(user.id) ?? []).filter((progress) =>
      purchasedCourseIds.has(progress.chapter.courseId),
    );
    const completedChapterIds = new Set(
      completedRows.map((progress) => progress.chapterId),
    );
    const totalLessons = userPurchases.reduce(
      (total, purchase) => total + purchase.course.chapters.length,
      0,
    );
    const completedCourses = userPurchases.filter(
      (purchase) =>
        purchase.course.chapters.length > 0 &&
        purchase.course.chapters.every((chapter) =>
          completedChapterIds.has(chapter.id),
        ),
    ).length;

    return {
      ...user,
      completedLessons: completedChapterIds.size,
      completedCourses,
      enrolledCourses: userPurchases.length,
      overallProgress: percentage(completedChapterIds.size, totalLessons),
      position: 0,
    };
  });

  return entries
    .sort(
      (left, right) =>
        right.completedLessons - left.completedLessons ||
        right.completedCourses - left.completedCourses ||
        right.overallProgress - left.overallProgress ||
        left.name.localeCompare(right.name, "es"),
    )
    .map((entry, index) => ({ ...entry, position: index + 1 }));
};

export const getLeaderboard = unstable_cache(
  loadLeaderboard,
  ["community-leaderboard-v1"],
  {
    revalidate: 60,
    tags: ["community-leaderboard"],
  },
);

export const getCommunityProfile = async (
  userId: string,
): Promise<CommunityProfile | null> => {
  const [user, purchases] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        headline: true,
        bio: true,
        location: true,
        createdAt: true,
        profileLinks: {
          orderBy: [{ position: "asc" }, { createdAt: "asc" }],
          select: { id: true, label: true, url: true },
        },
      },
    }),
    db.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            category: { select: { name: true } },
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
    }),
  ]);

  if (!user) {
    return null;
  }

  const completedChapterIds = new Set(
    purchases.flatMap((purchase) =>
      purchase.course.chapters
        .filter((chapter) => chapter.userProgress.length > 0)
        .map((chapter) => chapter.id),
    ),
  );

  const profilePurchases = purchases.map((purchase) => {
    const completedLessons = purchase.course.chapters.filter((chapter) =>
      completedChapterIds.has(chapter.id),
    ).length;
    const totalLessons = purchase.course.chapters.length;

    return {
      id: purchase.id,
      purchasedAt: purchase.createdAt,
      course: {
        id: purchase.course.id,
        title: purchase.course.title,
        imageUrl: purchase.course.imageUrl,
        category: purchase.course.category?.name ?? null,
      },
      completedLessons,
      totalLessons,
      progress: percentage(completedLessons, totalLessons),
    };
  });

  const completedLessons = completedChapterIds.size;
  const totalLessons = profilePurchases.reduce(
    (total, purchase) => total + purchase.totalLessons,
    0,
  );

  return {
    id: user.id,
    name: user.name,
    image: user.image,
    headline: user.headline,
    bio: user.bio,
    location: user.location,
    memberSince: user.createdAt,
    links: user.profileLinks,
    stats: {
      completedLessons,
      completedCourses: profilePurchases.filter(
        (purchase) =>
          purchase.totalLessons > 0 && purchase.progress === 100,
      ).length,
      enrolledCourses: profilePurchases.length,
      overallProgress: percentage(completedLessons, totalLessons),
    },
    purchases: profilePurchases,
  };
};
