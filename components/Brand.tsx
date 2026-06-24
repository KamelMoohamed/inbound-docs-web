import Image from "next/image";
import Link from "next/link";

// Intrinsic dimensions of public/clinidoc-icon.png — kept here so the icon
// always renders at its true aspect ratio regardless of the requested size.
const ICON_W = 1198;
const ICON_H = 1329;

type BrandProps = {
  /** Where the logo links to. Pass `null` to render without a link. */
  href?: string | null;
  /** Rendered icon height in px (width scales to keep aspect ratio). */
  iconSize?: number;
  /** Tailwind text-size class for the wordmark. */
  textClass?: string;
  /** Use light wordmark for dark backgrounds (e.g. admin). */
  dark?: boolean;
  /** Hide the "CliniDoc" wordmark and show the icon only. */
  iconOnly?: boolean;
  className?: string;
};

/**
 * CliniDoc brand lockup: clinical-document icon + wordmark.
 * The wordmark is split — "Clini" dark, "Doc" in the indigo accent — per brand.
 */
export function Brand({
  href = "/",
  iconSize = 28,
  textClass = "text-lg",
  dark = false,
  iconOnly = false,
  className = "",
}: BrandProps) {
  const width = Math.round((iconSize * ICON_W) / ICON_H);
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/clinidoc-icon.png"
        alt="CliniDoc"
        width={width}
        height={iconSize}
        priority
        unoptimized
        // Explicit dims override Tailwind preflight's `height: auto` on <img>,
        // which would otherwise trip Next's aspect-ratio warning.
        style={{ width, height: iconSize }}
      />
      {!iconOnly && (
        <span className={`font-semibold tracking-tight ${textClass}`}>
          <span className={dark ? "text-white" : "text-slate-900"}>Clini</span>
          <span className="text-indigo-600">Doc</span>
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
