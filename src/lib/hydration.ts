"use client";

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => {};
}

/**
 * Returns `false` during SSR and the first hydration render, then `true` once
 * mounted. Use it to gate DOM/localStorage-dependent UI without calling
 * setState inside an effect.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
