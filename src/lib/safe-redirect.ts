/**
 * Accepts only same-site relative paths ("/en/tasks"), so a crafted ?next= value
 * cannot send someone to another website after signing in.
 */
export function safeNextPath(next: unknown, fallback: string): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}
