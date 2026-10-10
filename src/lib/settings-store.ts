import { DEFAULT_SETTINGS, type AppSettings } from "./types";

const STORAGE_KEY = "bhumi.settings.v1";

type Listener = () => void;

let settings: AppSettings = DEFAULT_SETTINGS;
let hydrated = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable (private mode) — preferences stay in memory */
  }
}

/**
 * External store for user preferences so components can subscribe through
 * `useSyncExternalStore`. The server snapshot is always the defaults; the
 * stored values are applied after hydration, which keeps SSR output stable.
 */
export const settingsStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): AppSettings {
    return settings;
  },
  getHydratedSnapshot(): boolean {
    return hydrated;
  },
  hydrate(): void {
    if (hydrated) return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) settings = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
    } catch {
      /* keep defaults */
    }
    emit();
  },
  update(patch: Partial<AppSettings>): void {
    settings = { ...settings, ...patch };
    persist();
    emit();
  },
  reset(): void {
    settings = DEFAULT_SETTINGS;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    emit();
  },
};
