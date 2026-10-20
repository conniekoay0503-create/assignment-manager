import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import zhCN from "../messages/zh-CN.json";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { routing } from "@/i18n/routing";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") acc[path] = value;
    else Object.assign(acc, flatten(value, path));
    return acc;
  }, {});
}

const catalogs: Record<string, Record<string, string>> = {
  en: flatten(en),
  "zh-CN": flatten(zhCN),
};

describe("translation catalogs", () => {
  it("has a catalog for every configured locale", () => {
    expect(Object.keys(catalogs).sort()).toEqual([...routing.locales].sort());
  });

  it("zh-CN has exactly the same keys as en", () => {
    const enKeys = Object.keys(catalogs.en).sort();
    const zhKeys = Object.keys(catalogs["zh-CN"]).sort();
    expect(zhKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
    expect(enKeys.filter((k) => !zhKeys.includes(k))).toEqual([]);
  });

  it.each(Object.keys(catalogs))("%s has no empty strings", (locale) => {
    const empty = Object.entries(catalogs[locale])
      .filter(([, v]) => v.trim() === "")
      .map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it("translates every navigation item", () => {
    for (const locale of Object.keys(catalogs)) {
      for (const item of NAV_ITEMS) {
        expect(catalogs[locale][`Nav.${item.key}`], `${locale} Nav.${item.key}`).toBeTruthy();
      }
    }
  });

  it("uses the required Grades & CGPA labels", () => {
    expect(catalogs.en["Nav.grades"]).toBe("Grades & CGPA");
    expect(catalogs["zh-CN"]["Nav.grades"]).toBe("成绩与 CGPA");
  });
});
