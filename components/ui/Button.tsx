"use client";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
  secondary:
    "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  className,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            d="M12 2a10 10 0 1 0 10 10"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
