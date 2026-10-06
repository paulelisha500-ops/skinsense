"use client";

/**
 * Image loader for static exports (STATIC_EXPORT=1), which have no image
 * optimizer. Unsplash's CDN resizes on the fly, so each srcset width is
 * requested at that width, and auto=format serves AVIF/WebP where supported.
 * Without this, every photo downloads at full size whatever its `sizes`.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? url.searchParams.get("q") ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.href;
}
