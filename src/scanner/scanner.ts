import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ScanProgressEvent, ScanResult, ScanRule } from "./types";

export async function runScan(
  selectedFiveMPath: string,
  rules: ScanRule[],
  onProgress: (progress: ScanProgressEvent) => void,
): Promise<ScanResult[]> {
  const unlisten = await listen<ScanProgressEvent>("scan-progress", (event) => {
    onProgress(event.payload);
  });

  try {
    return await invoke<ScanResult[]>("scan_fivem", {
      path: selectedFiveMPath,
      rules,
    }).then((results) =>
      results.map((result) => ({
        ...result,
        foundFiles: result.foundFiles ?? [],
      })),
    );
  } finally {
    unlisten();
  }
}
