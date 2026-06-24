import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private app surfaces and API routes out of search indexes.
        disallow: [
          "/api/",
          "/auth/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/mfa-enroll",
          "/invitations",
          "/goodbye",
          "/onboarding",
          "/inbox",
          "/review",
          "/upload",
          "/dashboard",
          "/reports",
          "/billing",
          "/org",
          "/providers",
          "/roster",
          "/channels",
          "/settings",
          "/admin",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
