import { useEffect, useState } from "react";
import { checkAndInstallUpdate, type UpdateCheckResult } from "@/lib/updater";

export function useAutoUpdater(enabled = true) {
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function run(): Promise<void> {
      setChecking(true);
      const next = await checkAndInstallUpdate({ silent: true });
      if (!cancelled) {
        setResult(next);
        setChecking(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { result, checking, setResult };
}
