/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Make a string safe to use inside an SVG/HTML id or a url(#id) reference. */
export function safeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "");
}
