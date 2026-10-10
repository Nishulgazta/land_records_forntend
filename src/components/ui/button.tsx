import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white border-transparent hover:bg-brand-800 active:bg-brand-900",
  secondary:
    "bg-surface text-ink border-line-strong hover:bg-surface-2 active:bg-surface-3",
  ghost:
    "bg-transparent text-ink-2 border-transparent hover:bg-surface-3 hover:text-ink",
  danger: "bg-danger text-white border-transparent hover:bg-danger/90",
  subtle:
    "bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-100",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-10 px-5 text-sm gap-2",
};

export const buttonClassName = cn(
  "inline-flex items-center justify-center rounded-md border font-medium",
  "transition-colors select-none",
  "disabled:opacity-50 disabled:pointer-events-none",
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600",
);

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(buttonClassName, VARIANTS[variant], SIZES[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner className="size-3.5" /> : null}
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  prefetch?: boolean;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  prefetch,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={buttonClasses(variant, size, className)}
    >
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}
