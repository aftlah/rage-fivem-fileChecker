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

export const pluginsFolderRule: ScanRule = {
  id: "plugins-folder",
  name: "Plugins Folder",
  description: "Checks for a plugins folder, often used for .asi script loaders.",
  relativePath: "plugins",
  type: "directory",
  severity: "high",
};
