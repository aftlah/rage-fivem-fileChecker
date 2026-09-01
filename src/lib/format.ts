import type { OverallStatus, ScanResult, ScanSummary } from "@/scanner/types";

export function summarizeResults(results: ScanResult[]): ScanSummary {
  const detected = results.filter((result) => result.status === "DETECTED").length;
  const notDetected = results.filter((result) => result.status === "NOT_FOUND").length;
  const errors = results.filter((result) => result.status === "ERROR").length;
  const hasHighDetection = results.some(
    (result) => result.status === "DETECTED" && result.severity === "high",
  );

  let overallStatus: OverallStatus = "CLEAN";
  if (hasHighDetection) {
    overallStatus = "DETECTED";
  } else if (detected > 0 || errors > 0) {
    overallStatus = "WARNING";
  }

  return {
    totalChecks: results.length,
    detected,
    notDetected,
    errors,
    overallStatus,
  };
}

export function formatModifiedAt(value: number | null): string | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function truncatePath(path: string, maxLength = 64): string {
  if (path.length <= maxLength) {
    return path;
  }

  const keep = Math.floor((maxLength - 3) / 2);
  return `${path.slice(0, keep)}...${path.slice(-keep)}`;
}

export function formatScanDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function createHistoryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
