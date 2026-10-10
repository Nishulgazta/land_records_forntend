"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { settingsStore } from "@/lib/settings-store";
import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/types";

interface SettingsContextValue {
  settings: AppSettings;
  hydrated: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const subscribe = settingsStore.subscribe;

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settings = useSyncExternalStore(
    subscribe,
    settingsStore.getSnapshot,
    () => DEFAULT_SETTINGS,
  );
  const hydrated = useSyncExternalStore(
    subscribe,
    settingsStore.getHydratedSnapshot,
    () => false,
  );

  useEffect(() => {
    settingsStore.hydrate();
  }, []);

  useEffect(() => {
    document.body.dataset.density = settings.density;
  }, [settings.density]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    settingsStore.update(patch);
  }, []);

  const resetSettings = useCallback(() => {
    settingsStore.reset();
  }, []);

  const value = useMemo(
    () => ({ settings, hydrated, updateSettings, resetSettings }),
    [settings, hydrated, updateSettings, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used inside <SettingsProvider>");
  }
  return context;
}
