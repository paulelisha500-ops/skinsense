import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required for the static export (STATIC_EXPORT=1); harmless on Vercel.
export const dynamic = "force-static";

const ROUTES = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/faq", priority: 0.8 },
  { path: "/privacy", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
