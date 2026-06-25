"use client";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/Button";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md";

export function FormButton({
  children,
  variant = "secondary",
  size = "sm",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} loading={pending} className={className}>
      {children}
    </Button>
  );
}
