import { aiFolderRule } from "./aiFolder";
import { gameDataRules } from "./gameData";
import type { ScanRule } from "../types";

export const scanRules: ScanRule[] = [aiFolderRule, ...gameDataRules];

export function getRuleById(id: string): ScanRule | undefined {
  return scanRules.find((rule) => rule.id === id);
}
