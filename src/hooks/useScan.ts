import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";
import { summarizeResults } from "@/lib/format";
import { loadLastPath, saveLastPath } from "@/lib/storage";
import { detectFiveMPath, selectFolder, sendDiscordReport, validateFiveMPath } from "@/lib/tauri";
import { getErrorMessage } from "@/lib/utils";
import { getEnabledRules } from "@/scanner/rules";
import { runScan } from "@/scanner/scanner";
import type {
  ScanProgressEvent,
  ScanResult,
  ScanSummary,
  ValidationResult,
  DiscordSendStatus,
} from "@/scanner/types";
import { useHistory } from "./useHistory";
import { useSettings } from "./useSettings";

let scanInFlight = false;

export function useScan() {
  const { settings } = useSettings();
  const { addEntry } = useHistory();
  const [selectedPath, setSelectedPath] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgressEvent | null>(null);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [pathSource, setPathSource] = useState<"auto" | "manual" | null>(null);
  const [fiveMRunning, setFiveMRunning] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<DiscordSendStatus>("idle");
  const [discordError, setDiscordError] = useState<string | null>(null);
  const settingsRef = useRef(settings);
  const hadNameRef = useRef(settings.operatorName.trim().length > 0);
  const applyPathRef = useRef<
    (path: string, source?: "auto" | "manual", options?: { scan?: boolean }) => Promise<void>
  >(async () => undefined);
  settingsRef.current = settings;

  const startScan = useCallback(
    async (pathOverride?: string): Promise<ScanSummary | null> => {
      const pathToScan = (pathOverride ?? selectedPath).trim();
      if (!pathToScan) {
        setError("Choose a FiveM installation folder first.");
        return null;
      }

      const operatorName = settingsRef.current.operatorName.trim();
      if (!operatorName) {
        setError("Enter your name first.");
        return null;
      }

      const rules = getEnabledRules(settingsRef.current.enabledRules);
      if (rules.length === 0) {
        setError("Enable at least one scan rule in Settings.");
        return null;
      }

      if (scanInFlight) {
        return null;
      }

      scanInFlight = true;
      setIsScanning(true);
      setError(null);
      setProgress({
        current: 0,
        total: rules.length,
        ruleId: rules[0].id,
        ruleName: rules[0].name,
      });

      try {
        const scanResults = await runScan(pathToScan, rules, setProgress);
        const scanSummary = summarizeResults(scanResults);
        setResults(scanResults);
        setSummary(scanSummary);
        setHasScanned(true);
        addEntry(pathToScan, scanSummary);

        const webhookUrl = settingsRef.current.discordWebhookUrl.trim();
        if (webhookUrl) {
          setDiscordStatus("sending");
          setDiscordError(null);
          try {
            await sendDiscordReport({
              webhookUrl,
              playerName: operatorName,
              fiveMPath: pathToScan,
              overallStatus: scanSummary.overallStatus,
              detected: scanSummary.detected,
              notDetected: scanSummary.notDetected,
              errors: scanSummary.errors,
              results: scanResults.map((result) => ({
                name: result.name,
                status: result.status,
                relativePath: result.relativePath,
              })),
            });
            setDiscordStatus("sent");
          } catch (discordCaught) {
            setDiscordStatus("error");
            setDiscordError(getErrorMessage(discordCaught));
          }
        } else {
          setDiscordStatus("idle");
        }

        return scanSummary;
      } catch (caught) {
        setError(getErrorMessage(caught));
        setHasScanned(false);
        return null;
      } finally {
        scanInFlight = false;
        setIsScanning(false);
      }
    },
    [addEntry, selectedPath],
  );

  const applyPath = useCallback(
    async (
      path: string,
      source: "auto" | "manual" = "manual",
      options?: { scan?: boolean },
    ): Promise<void> => {
      setSelectedPath(path);
      saveLastPath(path);
      setError(null);
      setHasScanned(false);
      setResults([]);
      setSummary(null);
      setProgress(null);
      setPathSource(source);

      if (!path) {
        setValidation(null);
        return;
      }

      try {
        const nextValidation = await validateFiveMPath(path);
        const resolvedPath = nextValidation.suggestedPath ?? path;
        if (nextValidation.suggestedPath && !nextValidation.isValid) {
          setSelectedPath(resolvedPath);
          saveLastPath(resolvedPath);
          const suggestedValidation = await validateFiveMPath(resolvedPath);
          setValidation(suggestedValidation);
        } else {
          setValidation(nextValidation);
        }

        const shouldScan =
          (options?.scan ?? settingsRef.current.autoScan) &&
          settingsRef.current.operatorName.trim().length > 0;
        if (shouldScan) {
          await startScan(resolvedPath);
        }
      } catch (caught) {
        setValidation(null);
        setError(getErrorMessage(caught));
      }
    },
    [startScan],
  );
  applyPathRef.current = applyPath;

  useEffect(() => {
    let cancelled = false;

    async function boot(): Promise<void> {
      setIsDetecting(true);
      try {
        const lastPath = loadLastPath();
        if (lastPath) {
          const lastValidation = await validateFiveMPath(lastPath);
          if (!cancelled && (lastValidation.isValid || lastValidation.suggestedPath)) {
            await applyPathRef.current(lastPath, "manual");
            return;
          }
        }

        const detected = await detectFiveMPath();
        if (cancelled) {
          return;
        }

        if (detected) {
          await applyPathRef.current(detected, "auto");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(getErrorMessage(caught));
        }
      } finally {
        if (!cancelled) {
          setIsDetecting(false);
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    const pending = [
      listen<{ running: boolean }>("fivem-status", (event) => {
        if (!disposed) {
          setFiveMRunning(event.payload.running);
        }
      }),
      listen<{ installPath: string | null }>("fivem-launched", (event) => {
        void (async () => {
          const launchedPath = event.payload.installPath?.trim() ?? "";
          const path = launchedPath || (await detectFiveMPath()) || loadLastPath();

          if (!path) {
            setError("FiveM started, but the installation folder was not found.");
            return;
          }

          await applyPathRef.current(path, "auto", {
            scan: settingsRef.current.scanWhenFiveMStarts,
          });
        })();
      }),
    ];

    return () => {
      disposed = true;
      void Promise.all(pending).then((unlisteners) => {
        unlisteners.forEach((unlisten) => unlisten());
      });
    };
  }, []);

  useEffect(() => {
    const hasName = settings.operatorName.trim().length > 0;
    const justEnteredName = hasName && !hadNameRef.current;
    hadNameRef.current = hasName;

    if (!justEnteredName || !selectedPath || !settings.autoScan) {
      return;
    }

    void startScan(selectedPath);
  }, [selectedPath, settings.autoScan, settings.operatorName, startScan]);

  const browse = useCallback(async () => {
    setIsBrowsing(true);
    setError(null);

    try {
      const path = await selectFolder();
      if (path) {
        await applyPath(path, "manual");
      }
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setIsBrowsing(false);
    }
  }, [applyPath]);

  return {
    selectedPath,
    validation,
    isBrowsing,
    isDetecting,
    isScanning,
    progress,
    results,
    summary,
    error,
    hasScanned,
    pathSource,
    fiveMRunning,
    discordStatus,
    discordError,
    browse,
    applyPath,
    startScan,
  };
}
