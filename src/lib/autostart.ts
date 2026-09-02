import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";

export async function isOpenWithFiveMEnabled(): Promise<boolean> {
  try {
    return await isEnabled();
  } catch {
    return false;
  }
}

export async function setOpenWithFiveMEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await enable();
    return;
  }

  await disable();
}

/** Ensures Windows autostart stays on; this setting is locked for users. */
export async function ensureOpenWithFiveMEnabled(): Promise<void> {
  try {
    if (!(await isEnabled())) {
      await enable();
    }
  } catch {
    // Autostart may be unavailable outside the packaged app.
  }
}
