import type { ScanRule } from "../types";

export const aiFolderRule: ScanRule = {
  id: "ai-folder",
  name: "AI Folder",
  description:
    "Lists files inside the official AI folder (citizen/common/data/ai).",
  relativePath: "citizen/common/data/ai",
  type: "directory",
  severity: "high",
};
