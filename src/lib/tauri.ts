import { invoke } from "@tauri-apps/api/core";
import type { ScanResult, ScanRule, ValidationResult } from "@/scanner/types";

export function selectFolder(): Promise<string | null> {
  return invoke<string | null>("select_folder");
}

export function detectFiveMPath(): Promise<string | null> {
  return invoke<string | null>("detect_fivem_path");
}

export function getFiveMStatus(): Promise<{ running: boolean; installPath: string | null }> {
  return invoke<{ running: boolean; installPath: string | null }>("get_fivem_status");
}

export function validateFiveMPath(path: string): Promise<ValidationResult> {
  return invoke<ValidationResult>("validate_fivem_path", { path });
}

export function inspectPath(path: string, rule: ScanRule): Promise<ScanResult> {
  return invoke<ScanResult>("inspect_path", { path, rule });
}

export function openLocation(path: string): Promise<void> {
  return invoke<void>("open_location", { path });
}

export function hideMainWindow(): Promise<void> {
  return invoke<void>("hide_main_window");
}

export function showMainWindow(): Promise<void> {
  return invoke<void>("show_main_window_cmd");
}

export function scheduleWatchRestart(): Promise<void> {
  return invoke<void>("schedule_watch_restart");
}

export function sendDiscordReport(report: {
  webhookUrl: string;
  playerName: string;
  fiveMPath: string;
  overallStatus: string;
  detected: number;
  notDetected: number;
  errors: number;
  results: Array<{
    name: string;
    status: string;
    relativePath: string;
    foundFiles: string[];
  }>;
}): Promise<void> {
  return invoke<void>("send_discord_report", { report });
}
