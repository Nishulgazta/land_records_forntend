"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings as SettingsIcon } from "lucide-react";
import { useSettings } from "@/components/providers/settings-provider";
import { Badge } from "@/components/ui/badge";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { breadcrumbsFor } from "./nav";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function HeaderBar({
  pathname,
  onOpenMenu,
}: {
  pathname: string | null;
  onOpenMenu: () => void;
}) {
  const { settings } = useSettings();
  const crumbs = pathname ? breadcrumbsFor(pathname) : [];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="rounded-md p-2 text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          {crumbs.length > 0 ? (
            <ol className="flex items-center gap-1.5 overflow-hidden text-sm">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
                    {index > 0 ? (
                      <span className="text-ink-3" aria-hidden>
                        /
                      </span>
                    ) : null}
                    {isLast ? (
                      <span className="truncate font-medium text-ink" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="truncate text-ink-3 transition-colors hover:text-brand-700"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <span className="text-sm font-semibold tracking-tight text-ink lg:hidden">
              Bhumi
            </span>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {IS_MOCK_MODE ? (
            <Link href="/settings" className="hidden sm:block">
              <Badge tone="warning">Sample data · mock mode</Badge>
            </Link>
          ) : (
            <Badge tone="success">Backend connected</Badge>
          )}

          <Link
            href="/settings"
            aria-label="Open settings"
            className="rounded-md p-2 text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <SettingsIcon className="size-4.5" aria-hidden />
          </Link>

          <Link
            href="/settings"
            aria-label="Profile preferences"
            className="flex size-8 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white transition-colors hover:bg-brand-800"
          >
            {initials(settings.profileName)}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  return <HeaderBar pathname={pathname} onOpenMenu={onOpenMenu} />;
}

export function HeaderSkeleton({ onOpenMenu }: { onOpenMenu: () => void }) {
  return <HeaderBar pathname={null} onOpenMenu={onOpenMenu} />;
}
