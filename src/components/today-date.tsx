"use client";

import { useFormatter } from "next-intl";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
// A day-level string is stable between renders, so it is a valid snapshot.
const getDaySnapshot = () => new Date().toDateString();
const getServerSnapshot = () => null;

/** Today's date in the viewer's own time zone; empty during prerender so no build-time date is baked in. */
export function TodayDate({ className }: { className?: string }) {
  const format = useFormatter();
  const day = useSyncExternalStore(noopSubscribe, getDaySnapshot, getServerSnapshot);

  return (
    <span className={className} suppressHydrationWarning>
      {day ? format.dateTime(new Date(day), { dateStyle: "full" }) : " "}
    </span>
  );
}
