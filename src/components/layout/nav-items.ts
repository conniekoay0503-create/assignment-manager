import {
  Archive,
  Bell,
  BookOpen,
  CalendarDays,
  ChartColumn,
  Layers,
  LayoutGrid,
  Settings,
  SquareCheckBig,
  type LucideIcon,
} from "lucide-react";

export type NavKey =
  | "dashboard"
  | "semesters"
  | "subjects"
  | "tasks"
  | "calendar"
  | "grades"
  | "archive"
  | "notifications"
  | "settings";

export type NavItem = { key: NavKey; href: `/${string}`; icon: LucideIcon };

export const NAV_ITEMS: readonly NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutGrid },
  { key: "semesters", href: "/semesters", icon: Layers },
  { key: "subjects", href: "/subjects", icon: BookOpen },
  { key: "tasks", href: "/tasks", icon: SquareCheckBig },
  { key: "calendar", href: "/calendar", icon: CalendarDays },
  { key: "grades", href: "/grades", icon: ChartColumn },
  { key: "archive", href: "/archive", icon: Archive },
  { key: "notifications", href: "/notifications", icon: Bell },
  { key: "settings", href: "/settings", icon: Settings },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
