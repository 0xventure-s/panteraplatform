import type { MetadataRoute } from "next";

import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://francoalonso.com";
  const courses = await db.course.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
  });

  return [
    { url: siteUrl, lastModified: new Date(), priority: 1 },
    { url: `${siteUrl}/cursos`, lastModified: new Date(), priority: 0.9 },
    ...courses.map((course) => ({
      url: `${siteUrl}/cursos/${course.id}`,
      lastModified: course.updatedAt,
      priority: 0.8,
    })),
  ];
}
