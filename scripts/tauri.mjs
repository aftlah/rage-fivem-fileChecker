import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const cargoBin = path.join(os.homedir(), ".cargo", "bin");
const cargoFile = process.platform === "win32" ? "cargo.exe" : "cargo";

if (!fs.existsSync(path.join(cargoBin, cargoFile))) {
  console.error(
    "Rust/Cargo was not found. Install it from https://rustup.rs then open a new terminal.",
  );
  process.exit(1);
}

const pathParts = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
if (!pathParts.includes(cargoBin)) {
  process.env.PATH = `${cargoBin}${path.delimiter}${process.env.PATH ?? ""}`;
}

const tauriJs = path.join(
  process.cwd(),
  "node_modules",
  "@tauri-apps",
  "cli",
  "tauri.js",
);

const child = spawn(process.execPath, [tauriJs, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 1);
});
