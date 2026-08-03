import { PaymentStatus } from "@prisma/client";

import { db } from "@/lib/db";

export const getAnalytics = async (userId: string) => {
  try {
    const totalsByCourse = await db.payment.groupBy({
      by: ["courseId"],
      where: {
        status: PaymentStatus.APPROVED,
        course: { userId },
      },
      _sum: { amount: true },
      _count: { _all: true },
    });

    if (totalsByCourse.length === 0) {
      return {
        data: [],
        totalRevenue: 0,
        totalSales: 0,
      };
    }

    const courses = await db.course.findMany({
      where: {
        id: { in: totalsByCourse.map((total) => total.courseId) },
        userId,
      },
      select: { id: true, title: true },
    });
    const totals = new Map(
      totalsByCourse.map((total) => [total.courseId, total]),
    );
    const groupedEarnings = new Map<string, number>();

    for (const course of courses) {
      const total = totals.get(course.id);
      const amount = Number(total?._sum.amount?.toString() ?? 0);
      groupedEarnings.set(
        course.title,
        (groupedEarnings.get(course.title) ?? 0) + amount,
      );
    }

    const data = Array.from(groupedEarnings, ([name, total]) => ({
      name,
      total,
    }));

    return {
      data,
      totalRevenue: data.reduce((sum, item) => sum + item.total, 0),
      totalSales: totalsByCourse.reduce(
        (sum, total) => sum + total._count._all,
        0,
      ),
    };
  } catch (error) {
    console.error("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};
