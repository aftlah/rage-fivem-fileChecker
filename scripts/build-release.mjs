import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cargoBin = path.join(os.homedir(), ".cargo", "bin");
const pathParts = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
if (!pathParts.includes(cargoBin)) {
  process.env.PATH = `${cargoBin}${path.delimiter}${process.env.PATH ?? ""}`;
}

const keyPath = path.join(root, "src-tauri", "keys", "updater.key");
const envFile = path.join(root, ".signing.env");
const discordEnvFile = path.join(root, ".discord.env");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

if (!fs.existsSync(keyPath)) {
  console.error(`Missing signing key: ${keyPath}`);
  console.error('Generate with: npm run tauri -- signer generate -w src-tauri/keys/updater.key --ci --password "YOUR_PASSWORD"');
  process.exit(1);
}

process.env.CARGO_TARGET_DIR =
  process.env.CARGO_TARGET_DIR ?? path.join(root, "src-tauri", "target");
process.env.TAURI_SIGNING_PRIVATE_KEY = fs.readFileSync(keyPath, "utf8");
process.env.TAURI_SIGNING_PRIVATE_KEY_PATH = keyPath;

loadEnvFile(envFile);
loadEnvFile(discordEnvFile);

if (!process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD) {
  console.error("Set TAURI_SIGNING_PRIVATE_KEY_PASSWORD or create .signing.env with:");
  console.error("TAURI_SIGNING_PRIVATE_KEY_PASSWORD=your-password");
  process.exit(1);
}

if (!process.env.DISCORD_WEBHOOK_URL?.trim()) {
  console.error("Missing Discord webhook. Create .discord.env from .discord.env.example:");
  console.error("DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...");
  process.exit(1);
}

console.log("Signing with key:", keyPath);
console.log("Discord webhook: configured (hidden)");
console.log("Output target:", process.env.CARGO_TARGET_DIR);

const tauriJs = path.join(root, "node_modules", "@tauri-apps", "cli", "tauri.js");
const child = spawn(process.execPath, [tauriJs, "build"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  if (code !== 0) {
    process.exit(code ?? 1);
  }

  const makeLatest = spawn(process.execPath, [path.join(root, "scripts", "make-latest-json.mjs")], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  makeLatest.on("exit", (latestCode) => {
    process.exit(latestCode ?? 1);
  });
});
