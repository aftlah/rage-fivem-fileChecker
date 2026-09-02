import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { ensureOpenWithFiveMEnabled } from "@/lib/autostart";
import { applyTheme, loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings, ThemeMode } from "@/scanner/types";

interface SettingsContextValue {
  settings: AppSettings;
  setTheme: (theme: ThemeMode) => void;
  setOperatorName: (name: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }): ReactElement {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const loaded = loadSettings();
    applyTheme(loaded.theme);
    return loaded;
  });

  const update = useCallback((next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
    applyTheme(next.theme);
  }, []);

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      update({ ...settings, theme });
    },
    [settings, update],
  );

  useEffect(() => {
    void ensureOpenWithFiveMEnabled();
  }, []);

  const setOperatorName = useCallback(
    (operatorName: string) => {
      update({ ...settings, operatorName: operatorName.trim() });
    },
    [settings, update],
  );

  const value = useMemo(
    () => ({
      settings,
      setTheme,
      setOperatorName,
    }),
    [setOperatorName, setTheme, settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
