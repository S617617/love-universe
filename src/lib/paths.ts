/** Next Link/router add basePath automatically. Only raw asset URLs need this helper. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/love-universe";
export function assetUrl(src: string) {
  return src.startsWith("/") &&
    !src.startsWith("//") &&
    !src.startsWith(BASE_PATH + "/")
    ? BASE_PATH + src
    : src;
}
export function recordUrl(kind: string, id: string) {
  return `/${kind}/read/?id=${encodeURIComponent(id)}`;
}
export function normalizePath(path: string) {
  const clean =
    path === BASE_PATH
      ? "/"
      : path.startsWith(BASE_PATH + "/")
        ? path.slice(BASE_PATH.length)
        : path;
  return clean === "/" ? "/" : clean.replace(/\/+$/, "");
}
export const READABLE_MODULES = [
  "memories",
  "story",
  "diary",
  "letters",
  "universe",
  "growth",
  "future-mailbox",
  "map",
] as const;
