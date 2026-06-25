"use client";
import { useSyncExternalStore } from "react";

type Props = {
  /**
   * ISO string, epoch millis, or Date — typically a UTC timestamp from the API.
   * Omit to render the current time (useful with date-only `options`).
   */
  value?: string | number | Date;
  /** false renders date only; true (default) renders date + time. */
  withTime?: boolean;
  locale?: string;
  /** Explicit Intl options; overrides `withTime` when provided. */
  options?: Intl.DateTimeFormatOptions;
};

const subscribe = () => () => {};

function toDate(value?: string | number | Date): Date {
  return value === undefined ? new Date() : new Date(value);
}

function render(
  value: string | number | Date | undefined,
  withTime: boolean,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = toDate(value);
  if (options) return d.toLocaleString(locale, options);
  return withTime ? d.toLocaleString(locale) : d.toLocaleDateString(locale);
}

/**
 * Formats a timestamp in the browser's local timezone.
 *
 * Server components format dates in the server's timezone (UTC), so timestamps
 * always render as GMT+0. `useSyncExternalStore` renders the server (UTC) value
 * during hydration and then swaps to the client (local) value, giving each user
 * their own local time without a hydration mismatch.
 */
export function LocalTime({ value, withTime = true, locale, options }: Props) {
  const text = useSyncExternalStore(
    subscribe,
    () => render(value, withTime, locale, options),
    () => render(value, withTime, locale, options),
  );

  return (
    <time dateTime={toDate(value).toISOString()} suppressHydrationWarning>
      {text}
    </time>
  );
}
