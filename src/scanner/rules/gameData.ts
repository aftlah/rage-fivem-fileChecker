import type { ScanRule } from "../types";

export const gameDataRules: ScanRule[] = [
  {
    id: "ped-accuracy",
    name: "Ped Accuracy",
    description:
      "Client file that can change recoil and NPC/player shooting accuracy.",
    relativePath: "citizen/common/data/ai/pedaccuracy.meta",
    type: "file",
    severity: "high",
  },
  {
    id: "weapons-meta",
    name: "Weapons Meta",
    description: "Client file that can change weapon damage, range, or fire rate.",
    relativePath: "citizen/common/data/ai/weapons.meta",
    type: "file",
    severity: "high",
  },
  {
    id: "handling",
    name: "Handling Meta",
    description: "Client file that can change vehicle handling and physics.",
    relativePath: "citizen/common/data/handling.meta",
    type: "file",
    severity: "high",
  },
  {
    id: "vehicles-meta",
    name: "Vehicles Meta",
    description: "Client file that can change vehicle definitions and stats.",
    relativePath: "citizen/common/data/levels/gta5/vehicles.meta",
    type: "file",
    severity: "high",
  },
  {
    id: "watertune",
    name: "Water Tune",
    description: "Client file that can change water physics and appearance.",
    relativePath: "citizen/common/data/watertune.xml",
    type: "file",
    severity: "medium",
  },
];
