import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createHistoryId } from "@/lib/format";
import { loadHistory, saveHistory } from "@/lib/storage";
import type { ScanHistoryEntry, ScanSummary } from "@/scanner/types";

interface HistoryContextValue {
  entries: ScanHistoryEntry[];
  addEntry: (fiveMPath: string, summary: ScanSummary) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }): ReactElement {
  const [entries, setEntries] = useState<ScanHistoryEntry[]>(() => loadHistory());

  const addEntry = useCallback((fiveMPath: string, summary: ScanSummary) => {
    const entry: ScanHistoryEntry = {
      id: createHistoryId(),
      scannedAt: new Date().toISOString(),
      fiveMPath,
      totalChecks: summary.totalChecks,
      detected: summary.detected,
      notDetected: summary.notDetected,
      errors: summary.errors,
      overallStatus: summary.overallStatus,
    };

    setEntries((current) => {
      const next = [entry, ...current];
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    saveHistory([]);
  }, []);

  const value = useMemo(
    () => ({ entries, addEntry, clearHistory }),
    [addEntry, clearHistory, entries],
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within HistoryProvider");
  }
  return context;
}
