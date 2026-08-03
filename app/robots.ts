import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://francoalonso.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/cursos"],
      disallow: ["/admin", "/dashboard", "/courses", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
