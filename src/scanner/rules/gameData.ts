import type { ScanRule } from "../types";

/**
 * These rules search the entire FiveM folder by filename.
 * Cheats sometimes place the same files outside the official paths.
 */
export const gameDataRules: ScanRule[] = [
  {
    id: "ped-accuracy",
    name: "Ped Accuracy",
    description:
      "Looks for pedaccuracy.meta anywhere in the FiveM folder (not only the AI folder).",
    relativePath: "pedaccuracy.meta",
    type: "file-search",
    severity: "high",
  },
  {
    id: "weapons-meta",
    name: "Weapons Meta",
    description:
      "Looks for weapons.meta anywhere in the FiveM folder (not only the AI folder).",
    relativePath: "weapons.meta",
    type: "file-search",
    severity: "high",
  },
  {
    id: "handling",
    name: "Handling Meta",
    description:
      "Looks for handling.meta anywhere in the FiveM folder (not only the official data path).",
    relativePath: "handling.meta",
    type: "file-search",
    severity: "high",
  },
  {
    id: "vehicles-meta",
    name: "Vehicles Meta",
    description:
      "Looks for vehicles.meta anywhere in the FiveM folder (not only levels/gta5).",
    relativePath: "vehicles.meta",
    type: "file-search",
    severity: "high",
  },
];
