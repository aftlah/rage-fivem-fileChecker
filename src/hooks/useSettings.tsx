import { createContext, useCallback, useContext, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { applyTheme, defaultSettings, loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings, ThemeMode } from "@/scanner/types";

interface SettingsContextValue {
  settings: AppSettings;
  setTheme: (theme: ThemeMode) => void;
  setAutoScan: (autoScan: boolean) => void;
  setScanWhenFiveMStarts: (enabled: boolean) => void;
  setOperatorName: (name: string) => void;
  resetSettings: () => void;
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

  const setAutoScan = useCallback(
    (autoScan: boolean) => {
      update({ ...settings, autoScan });
    },
    [settings, update],
  );

  const setScanWhenFiveMStarts = useCallback(
    (scanWhenFiveMStarts: boolean) => {
      update({ ...settings, scanWhenFiveMStarts });
    },
    [settings, update],
  );

  const setOperatorName = useCallback(
    (operatorName: string) => {
      update({ ...settings, operatorName: operatorName.trim() });
    },
    [settings, update],
  );

  const resetSettings = useCallback(() => {
    update({
      ...defaultSettings,
      operatorName: settings.operatorName,
    });
  }, [settings.operatorName, update]);

  const value = useMemo(
    () => ({
      settings,
      setTheme,
      setAutoScan,
      setScanWhenFiveMStarts,
      setOperatorName,
      resetSettings,
    }),
    [
      resetSettings,
      setAutoScan,
      setOperatorName,
      setScanWhenFiveMStarts,
      setTheme,
      settings,
    ],
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
