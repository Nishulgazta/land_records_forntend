import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const controlClassName = cn(
  "w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink",
  "placeholder:text-ink-3",
  "transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600",
  "disabled:bg-surface-2 disabled:text-ink-3 disabled:pointer-events-none",
  "h-9",
);

export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClassName, className)} {...rest} />;
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(controlClassName, "h-auto min-h-20 py-2 leading-6", className)}
      {...rest}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(controlClassName, "appearance-none pr-8", className)}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-3"
        aria-hidden
      />
    </div>
  );
}

export function Label({
  htmlFor,
  children,
  hint,
  className,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-2", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink-2">
        {children}
      </label>
      {hint ? <span className="text-[11px] text-ink-3">{hint}</span> : null}
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({
  label,
  description,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-2.5 rounded-md border border-line bg-surface px-3 py-2.5",
        "cursor-pointer transition-colors hover:bg-surface-2",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand-700)]"
        {...rest}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-ink-3">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(controlClassName, "pl-9", className)}
      />
    </div>
  );
}
