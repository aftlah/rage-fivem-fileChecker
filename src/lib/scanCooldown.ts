const LAST_SCAN_KEY = "rage-file-checker:last-scan-at";

/** Minimum wait between scans (2 minutes). */
export const SCAN_COOLDOWN_MS = 2 * 60 * 1000;

export function getLastScanAt(): number | null {
  const raw = localStorage.getItem(LAST_SCAN_KEY);
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function markScanCompleted(at = Date.now()): void {
  localStorage.setItem(LAST_SCAN_KEY, String(at));
}

export function getScanCooldownRemainingMs(now = Date.now()): number {
  const lastScanAt = getLastScanAt();
  if (lastScanAt == null) {
    return 0;
  }

  const elapsed = now - lastScanAt;
  return Math.max(0, SCAN_COOLDOWN_MS - elapsed);
}

export function canScanNow(now = Date.now()): boolean {
  return getScanCooldownRemainingMs(now) === 0;
}

export function formatCooldownRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes} menit ${seconds} detik`;
  }

  return `${seconds} detik`;
}
