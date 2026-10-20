"use client";

import { LogOut, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/server/actions/auth";

export function AccountMenu({ email, displayName }: { email: string | null; displayName: string | null }) {
  const t = useTranslations("Account");
  const locale = useLocale();
  const label = displayName || email || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("menu")}
          className="flex size-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground uppercase"
        >
          {label.slice(0, 1)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-xs text-muted-foreground">{t("signedInAs")}</span>
          <span className="truncate font-medium">{displayName ?? email}</span>
          {displayName && email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings aria-hidden="true" />
            {t("settings")}
          </Link>
        </DropdownMenuItem>
        <form action={signOut}>
          <input type="hidden" name="locale" value={locale} />
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut aria-hidden="true" />
              {t("signOut")}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
