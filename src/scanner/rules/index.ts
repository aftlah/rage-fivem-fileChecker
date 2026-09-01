import { aiFolderRule } from "./aiFolder";
import type { ScanRule } from "../types";

export const scanRules: ScanRule[] = [aiFolderRule];

export function getRuleById(id: string): ScanRule | undefined {
  return scanRules.find((rule) => rule.id === id);
}

export function getEnabledRules(enabledRules: Record<string, boolean>): ScanRule[] {
  return scanRules.filter((rule) => enabledRules[rule.id] !== false);
}
