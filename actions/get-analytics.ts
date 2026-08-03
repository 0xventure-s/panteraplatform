import { db } from "@/lib/db";
import { Course, Payment, PaymentStatus } from "@prisma/client";

type PaymentWithCourse = Payment & {
  course: Course;
};

const groupByCourse = (payments: PaymentWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};
  
  payments.forEach((payment) => {
    const courseTitle = payment.course.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }
    grouped[courseTitle] += Number(payment.amount.toString());
  });

  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {
    const payments = await db.payment.findMany({
      where: {
        status: PaymentStatus.APPROVED,
        course: {
          userId: userId
        }
      },
      include: {
        course: true,
      }
    });

    const groupedEarnings = groupByCourse(payments);
    const data = Object.entries(groupedEarnings).map(([courseTitle, total]) => ({
      name: courseTitle,
      total: total,
    }));

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = payments.length;

    return {
      data,
      totalRevenue,
      totalSales,
    }
  } catch (error) {
    console.log("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    }
  }
}
