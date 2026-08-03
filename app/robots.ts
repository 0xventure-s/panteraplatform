import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = siteConfig.url.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/cursos"],
      disallow: ["/admin", "/dashboard", "/courses", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
