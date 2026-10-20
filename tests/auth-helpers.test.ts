import { describe, expect, it } from "vitest";
import { isPublicPath, splitLocale } from "@/lib/auth-routes";
import { safeNextPath } from "@/lib/safe-redirect";
import { firstIssue, signInSchema, signUpSchema } from "@/lib/validation/auth";

describe("safeNextPath", () => {
  it.each([
    ["/en/tasks", "/en/tasks"],
    ["/zh-CN/dashboard?x=1", "/zh-CN/dashboard?x=1"],
  ])("keeps same-site path %s", (input, expected) => {
    expect(safeNextPath(input, "/en/dashboard")).toBe(expected);
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/en/\nx", "", null, 42])(
    "rejects %s",
    (input) => {
      expect(safeNextPath(input, "/en/dashboard")).toBe("/en/dashboard");
    },
  );
});

describe("route helpers", () => {
  it("splits the locale prefix", () => {
    expect(splitLocale("/zh-CN/tasks/1")).toEqual({ locale: "zh-CN", path: "/tasks/1" });
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/fr/login")).toEqual({ locale: null, path: "/fr/login" });
  });

  it("treats only the auth pages as public", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/signup")).toBe(true);
    expect(isPublicPath("/forgot-password")).toBe(true);
    expect(isPublicPath("/reset-password")).toBe(false);
    expect(isPublicPath("/dashboard")).toBe(false);
    expect(isPublicPath("/loginx")).toBe(false);
  });
});

describe("auth validation", () => {
  const base = { email: "Student@Example.com ", locale: "en" };

  it("normalises email and accepts a good password", () => {
    const parsed = signUpSchema.parse({ ...base, password: "study2026" });
    expect(parsed.email).toBe("student@example.com");
  });

  it.each([
    ["short1", "passwordTooShort"],
    ["onlyletters", "passwordNeedsDigit"],
    ["12345678", "passwordNeedsLetter"],
  ])("rejects password %s with %s", (password, code) => {
    const result = signUpSchema.safeParse({ ...base, password });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstIssue(result.error)).toBe(code);
  });

  it("rejects an unsupported locale and a bad email", () => {
    expect(signInSchema.safeParse({ ...base, password: "x", locale: "fr" }).success).toBe(false);
    const bad = signInSchema.safeParse({ ...base, email: "nope", password: "x" });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(firstIssue(bad.error)).toBe("invalidEmail");
  });
});
