import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { useScan as useScanState } from "@/hooks/useScan";

type ScanContextValue = ReturnType<typeof useScanState>;

const ScanContext = createContext<ScanContextValue | null>(null);

export function ScanProvider({ children }: { children: ReactNode }): ReactElement {
  const value = useScanState();
  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScanContext(): ScanContextValue {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error("useScanContext must be used within ScanProvider");
  }
  return context;
}
