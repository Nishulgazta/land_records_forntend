"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Header, HeaderSkeleton } from "./header";
import { MobileSidebar, SidebarContent, SidebarSkeleton } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-brand-700 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-surface lg:block">
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarContent />
        </Suspense>
      </aside>

      <Suspense fallback={null}>
        <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      </Suspense>

      <div className="lg:pl-60">
        <Suspense fallback={<HeaderSkeleton onOpenMenu={() => setMenuOpen(true)} />}>
          <Header onOpenMenu={() => setMenuOpen(true)} />
        </Suspense>
        <main id="main-content" className="px-4 py-5 sm:px-6 lg:px-7">
          {children}
        </main>
      </div>
    </div>
  );
}
