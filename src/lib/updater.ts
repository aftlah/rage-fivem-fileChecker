import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { getErrorMessage } from "@/lib/utils";

export type UpdateCheckResult =
  | { status: "up-to-date" }
  | { status: "updated"; version: string }
  | { status: "skipped"; reason: string }
  | { status: "error"; message: string };

/**
 * Checks GitHub Releases for a newer signed build, installs it, then relaunches.
 * Safe to call on boot (watch mode included).
 */
export async function checkAndInstallUpdate(options?: {
  silent?: boolean;
}): Promise<UpdateCheckResult> {
  try {
    const update = await check();
    if (!update) {
      return { status: "up-to-date" };
    }

    await update.downloadAndInstall();
    await relaunch();
    return { status: "updated", version: update.version };
  } catch (error) {
    const message = getErrorMessage(error);
    // Dev builds / missing updater config should not block the app.
    if (options?.silent) {
      return { status: "skipped", reason: message };
    }
    return { status: "error", message };
  }
}
