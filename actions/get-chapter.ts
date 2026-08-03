import { db } from "@/lib/db";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
};

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    const [purchase, course, chapter] = await Promise.all([
      db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        select: { id: true },
      }),
      db.course.findUnique({
        where: {
          isPublished: true,
          id: courseId,
        },
        select: { price: true },
      }),
      db.chapter.findUnique({
        where: {
          id: chapterId,
          courseId,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          position: true,
          isFree: true,
        },
      }),
    ]);

    if (!chapter || !course) {
      throw new Error("No encontramos el curso o la lección");
    }

    const canViewContent = chapter.isFree || Boolean(purchase);
    const [attachments, muxData, nextChapter, userProgress] = await Promise.all([
      purchase
        ? db.attachment.findMany({
            where: { courseId },
            select: { id: true, name: true, url: true },
          })
        : Promise.resolve([]),
      canViewContent
        ? db.muxData.findUnique({
            where: { chapterId },
            select: { playbackId: true },
          })
        : Promise.resolve(null),
      canViewContent
        ? db.chapter.findFirst({
            where: {
              courseId,
              isPublished: true,
              position: { gt: chapter.position },
            },
            orderBy: { position: "asc" },
            select: { id: true },
          })
        : Promise.resolve(null),
      db.userProgress.findUnique({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          },
        },
        select: { isCompleted: true },
      }),
    ]);

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    }
  }
}
