import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const bundleDir = join(root, "src-tauri", "target", "release", "bundle");
const stageDir = join(root, "release");

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function collect(directory, extension) {
  if (!existsSync(directory)) {
    return [];
  }

  const found = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);

    if (entry.isDirectory()) {
      found.push(...collect(full, extension));
    } else if (entry.name.endsWith(extension)) {
      found.push(full);
    }
  }

  return found;
}

function createPortable(version) {
  const exe = join(
    root,
    "src-tauri",
    "target",
    "release",
    "zapret-manager.exe"
  );

  if (!existsSync(exe)) {
    console.log("portable: бинарь не найден, пропуск");
    return null;
  }

  const zip = join(stageDir, `ZapretManager_${version}_x64_portable.zip`);

  if (process.platform === "win32") {
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Compress-Archive -Path '${exe}' -DestinationPath '${zip}' -Force`,
      ],
      { stdio: "ignore" }
    );
  } else {
    copyFileSync(exe, zip.replace(/\.zip$/, ""));
  }

  console.log(`portable: ${zip}`);

  return zip;
}

const { version } = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8")
);
const installers = [
  ...collect(join(bundleDir, "nsis"), ".exe"),
  ...collect(join(bundleDir, "msi"), ".msi"),
].filter((path) => !basename(path).toLowerCase().startsWith("uninstall"));

if (installers.length === 0) {
  console.error("Установщики не найдены. Сначала выполните: pnpm tauri build");
  process.exit(1);
}

mkdirSync(stageDir, { recursive: true });

const staged = [];

for (const installer of installers) {
  const target = join(stageDir, basename(installer));
  copyFileSync(installer, target);
  staged.push(target);
}

const portable = createPortable(version);

if (portable !== null) {
  staged.push(portable);
}

const lines = staged.map((path) => `${sha256(path)}  ${basename(path)}`);

writeFileSync(
  join(stageDir, "SHA256SUMS.txt"),
  `${lines.join("\n")}\n`,
  "utf8"
);

console.log(`Версия: ${version}`);
for (const line of lines) {
  console.log(`  ${line}`);
}
console.log(`Контрольные суммы: ${join(stageDir, "SHA256SUMS.txt")}`);
