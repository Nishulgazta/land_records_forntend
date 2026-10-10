"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LandPlot, X } from "lucide-react";
import { IS_MOCK_MODE, MODE_LABEL } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS, isNavItemActive } from "./nav";

function BrandMark() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-700 text-white">
      <LandPlot className="size-5" aria-hidden />
    </span>
  );
}

export function SidebarBody({
  activeHref,
  onNavigate,
}: {
  activeHref: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
        <BrandMark />
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-ink">Bhumi</p>
          <p className="text-[11px] text-ink-3">Land Intelligence</p>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.title ?? "main"}>
            {section.title ? (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = activeHref !== null && isNavItemActive(item, activeHref);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-brand-50 font-medium text-brand-800 ring-1 ring-brand-200"
                          : "text-ink-2 hover:bg-surface-3 hover:text-ink",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-brand-700" : "text-ink-3 group-hover:text-ink-2",
                        )}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-4 py-3">
        <p className="text-[11px] leading-4 text-ink-3">{MODE_LABEL}</p>
        {IS_MOCK_MODE ? (
          <p className="mt-1 text-[11px] leading-4 text-warning">
            Sample dataset — not official land records.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <SidebarBody activeHref={pathname} onNavigate={onNavigate} />;
}

export function SidebarSkeleton() {
  return <SidebarBody activeHref={null} />;
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        className={cn(
          "absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface shadow-xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute right-3 top-3 rounded-md p-1 text-ink-3 hover:bg-surface-3 hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}
