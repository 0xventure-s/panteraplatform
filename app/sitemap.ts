import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteConfig.url.replace(/\/$/, "");
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
