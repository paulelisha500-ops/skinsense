import type { Metadata } from "next";

/**
 * Site-wide constants.
 *
 * NEXT_PUBLIC_APP_URL  – where every "Open the app / Analyse my skin" CTA points.
 * NEXT_PUBLIC_SITE_URL – the public URL of this marketing site (used for
 *                        canonical URLs, Open Graph, sitemap and robots). On
 *                        Vercel it falls back to the production domain.
 */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://elisha622-skinsense.hf.space"
).replace(/\/$/, "");

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "SkinSense";

export const SITE_TAGLINE = "Understand your skin. Then actually improve it.";

export const SITE_DESCRIPTION =
  "SkinSense is a free AI skin-screening web app. Take one photo, get a clear reading across seven common skin conditions with a confidence score, and follow a morning and evening routine built around active ingredients.";

/** Per-page metadata with matching canonical, Open Graph and Twitter fields. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  return {
    title: title ?? { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_GB",
      url: path,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
