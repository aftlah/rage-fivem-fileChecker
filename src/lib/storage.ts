import { scanRules } from "@/scanner/rules";
import type { AppSettings, ScanHistoryEntry, ThemeMode } from "@/scanner/types";

const SETTINGS_KEY = "rage-file-checker:settings";
const HISTORY_KEY = "rage-file-checker:history";
const LAST_PATH_KEY = "rage-file-checker:last-path";
const SETUP_COMPLETE_KEY = "rage-file-checker:setup-complete";
const MAX_HISTORY = 50;

export const defaultSettings: AppSettings = {
  enabledRules: Object.fromEntries(scanRules.map((rule) => [rule.id, true])),
  theme: "dark",
  autoScan: true,
  scanWhenFiveMStarts: true,
  operatorName: "",
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
  return {
    enabledRules: defaultSettings.enabledRules,
    theme: stored?.theme === "light" ? "light" : "dark",
    autoScan: defaultSettings.autoScan,
    scanWhenFiveMStarts: defaultSettings.scanWhenFiveMStarts,
    operatorName: stored?.operatorName?.trim() ?? "",
  };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      theme: settings.theme,
      operatorName: settings.operatorName,
    }),
  );
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

export function isSetupComplete(): boolean {
  return localStorage.getItem(SETUP_COMPLETE_KEY) === "true";
}

export function markSetupComplete(): void {
  localStorage.setItem(SETUP_COMPLETE_KEY, "true");
}

export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}
