import type { ScanRule } from "../types";

export const extraScriptsRule: ScanRule = {
  id: "extra-scripts",
  name: "Extra Scripts",
  description:
    "Looks for .lua, .js, and .asi scripts outside FiveM's official scripting folders.",
  relativePath: ".",
  type: "scripts",
  severity: "high",
};
