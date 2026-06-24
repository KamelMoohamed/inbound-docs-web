import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_ROUTES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map((path) => {
    const isHome = path === "";
    return {
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: isHome ? "weekly" : "monthly",
      priority: isHome ? 1 : path === "/pricing" ? 0.9 : 0.7,
    };
  });
}
