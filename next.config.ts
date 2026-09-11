import type { NextConfig } from "next";

/**
 * Remote images are limited to the Unsplash CDN, and only to the exact query
 * strings the site uses (see lib/images.ts). Anything else returns 400 from the
 * image optimizer, so the endpoint cannot be abused to resize arbitrary URLs.
 */
// STATIC_EXPORT=1 builds a plain-HTML copy into out/ for static hosts (the
// Hugging Face static Space). Vercel builds leave it unset and keep the optimizer.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(staticExport ? { output: "export", trailingSlash: true } : {}),
  images: {
    unoptimized: staticExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
        search: "?w=1200&q=80",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
        search: "?w=2000&q=80",
      },
    ],
  },
};

export default nextConfig;
