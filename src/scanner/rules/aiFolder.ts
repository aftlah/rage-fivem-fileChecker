import type { ScanRule } from "../types";

export const aiFolderRule: ScanRule = {
  id: "ai-folder",
  name: "AI Folder",
  description:
    "Checks the AI folder and lists files inside it, such as pedaccuracy.meta.",
  relativePath: "citizen/common/data/ai",
  type: "directory",
  severity: "high",
};
