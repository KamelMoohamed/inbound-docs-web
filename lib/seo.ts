import type { Metadata, Viewport } from "next";

/**
 * Central SEO config. The production domain is baked in as the default but can be
 * overridden per environment via NEXT_PUBLIC_SITE_URL (e.g. preview deployments).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://clinidoc.com.au"
).replace(/\/+$/, "");

export const SITE_NAME = "CliniDoc";

export const SITE_TITLE = `${SITE_NAME} — clinical document triage for Australian practices`;

export const SITE_DESCRIPTION =
  "Automatically triage, match and file incoming clinical documents into your practice software. Onshore in Australia, encrypted, human-in-the-loop.";

/** Brand indigo — used for the browser chrome / PWA theme colour. */
export const THEME_COLOR = "#4f46e5";

/** Public marketing routes that should be indexed and listed in the sitemap. */
export const PUBLIC_ROUTES = [
  "",
  "/pricing",
  "/integrations",
  "/integrations/request",
  "/customers",
  "/security",
  "/faq",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/dpa",
  "/sub-processors",
  "/help/cliniko",
] as const;

/** Shared mobile-chrome / viewport config for indexable pages. */
export const baseViewport: Viewport = {
  themeColor: THEME_COLOR,
  width: "device-width",
  initialScale: 1,
};

/**
 * Root metadata for the public marketing site. Per-page metadata is layered on
 * top via `pageMetadata()`; anything not overridden falls back to these values.
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "clinical document triage",
    "medical document management",
    "inbound fax management",
    "pathology results filing",
    "GP practice software",
    "practice management system integration",
    "Best Practice",
    "MedicalDirector",
    "healthcare automation Australia",
    "secure medical document handling",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Healthcare",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_AU",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/**
 * Build metadata for an individual marketing page: sets the page title (the root
 * template appends "— CliniDoc"), description, and a per-page canonical + OG URL.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description?: string;
  path: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url,
    },
    twitter: {
      title: `${title} — ${SITE_NAME}`,
      description,
    },
  };
}

/**
 * Metadata for private/app surfaces (auth, dashboard, admin). Keeps them out of
 * search indexes while still resolving relative asset URLs via metadataBase.
 */
export const noindexMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

/** schema.org JSON-LD for the organisation, website and product. */
export function structuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      description: SITE_DESCRIPTION,
      areaServed: { "@type": "Country", name: "Australia" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        url: `${SITE_URL}/contact`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "en-AU",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      offers: {
        "@type": "Offer",
        category: "SaaS",
        availability: "https://schema.org/InStock",
      },
    },
  ];
}
