import type { NextConfig } from "next";

/**
 * Remote images are limited to the Unsplash CDN, and only to the exact query
 * strings the site uses (see lib/images.ts). Anything else returns 400 from the
 * image optimizer, so the endpoint cannot be abused to resize arbitrary URLs.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
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
