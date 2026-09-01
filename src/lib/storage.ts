import { scanRules } from "@/scanner/rules";
import type { AppSettings, ScanHistoryEntry, ThemeMode } from "@/scanner/types";

const SETTINGS_KEY = "rage-fivem-file-checker:settings";
const HISTORY_KEY = "rage-fivem-file-checker:history";
const LAST_PATH_KEY = "rage-fivem-file-checker:last-path";
const MAX_HISTORY = 50;

export const defaultSettings: AppSettings = {
  enabledRules: Object.fromEntries(scanRules.map((rule) => [rule.id, true])),
  theme: "dark",
  autoScan: true,
  scanWhenFiveMStarts: true,
};

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function loadSettings(): AppSettings {
  const stored = parseJson<Partial<AppSettings>>(localStorage.getItem(SETTINGS_KEY));
  const enabledRules = {
    ...defaultSettings.enabledRules,
    ...(stored?.enabledRules ?? {}),
  };

  return {
    enabledRules,
    theme: stored?.theme === "light" ? "light" : "dark",
    autoScan: stored?.autoScan !== false,
    scanWhenFiveMStarts: stored?.scanWhenFiveMStarts !== false,
  };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadHistory(): ScanHistoryEntry[] {
  return parseJson<ScanHistoryEntry[]>(localStorage.getItem(HISTORY_KEY)) ?? [];
}

export function saveHistory(entries: ScanHistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

export function loadLastPath(): string {
  return localStorage.getItem(LAST_PATH_KEY) ?? "";
}

export function saveLastPath(path: string): void {
  localStorage.setItem(LAST_PATH_KEY, path);
}

export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}
