import type { ScanRule } from "../types";

export const aiFolderRule: ScanRule = {
  id: "ai-folder",
  name: "AI Folder",
  description: "Checks whether the FiveM AI folder exists.",
  relativePath: "citizen/common/data/ai",
  type: "directory",
  severity: "high",
};
