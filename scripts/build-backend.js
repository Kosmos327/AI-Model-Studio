#!/usr/bin/env node
/**
 * Build the FastAPI backend with PyInstaller and place the resulting binary
 * in src-tauri/binaries/ with the Tauri sidecar naming convention:
 *
 *   backend-<target-triple>[.exe]
 *
 * Run from the repository root:
 *   node scripts/build-backend.js
 */

const { execSync } = require("child_process");
const { mkdirSync, copyFileSync, chmodSync, existsSync } = require("fs");
const { join } = require("path");
const os = require("os");

function getTargetTriple() {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === "win32") {
    return arch === "arm64"
      ? "aarch64-pc-windows-msvc"
      : "x86_64-pc-windows-msvc";
  }
  if (platform === "darwin") {
    return arch === "arm64" ? "aarch64-apple-darwin" : "x86_64-apple-darwin";
  }
  // Linux
  return arch === "arm64"
    ? "aarch64-unknown-linux-gnu"
    : "x86_64-unknown-linux-gnu";
}

const repoRoot = join(__dirname, "..");
const backendDir = join(repoRoot, "backend");
const binariesDir = join(repoRoot, "src-tauri", "binaries");
const isWindows = os.platform() === "win32";
const ext = isWindows ? ".exe" : "";
const targetTriple = getTargetTriple();

// Ensure output directory exists.
mkdirSync(binariesDir, { recursive: true });

console.log("Building backend with PyInstaller…");
execSync("python -m PyInstaller backend.spec --clean", {
  cwd: backendDir,
  stdio: "inherit",
});

const src = join(backendDir, "dist", `backend${ext}`);
const dest = join(binariesDir, `backend-${targetTriple}${ext}`);

if (!existsSync(src)) {
  console.error(`Expected binary not found: ${src}`);
  process.exit(1);
}

console.log(`\nCopying  ${src}`);
console.log(`      →  ${dest}`);
copyFileSync(src, dest);

if (!isWindows) {
  chmodSync(dest, 0o755);
}

console.log(`\nBackend binary ready: ${dest}`);
