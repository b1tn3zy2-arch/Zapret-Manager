import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
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
  const releaseDir = join(root, "src-tauri", "target", "release");
  const exe = join(releaseDir, "zapret-manager.exe");
  const resources = join(releaseDir, "resources");

  if (!existsSync(exe)) {
    console.log("portable: бинарь не найден, пропуск");
    return null;
  }

  if (!existsSync(resources)) {
    console.error(
      "portable: каталог resources отсутствует, сборка некорректна"
    );
    process.exitCode = 1;
    return null;
  }

  const stage = join(stageDir, "portable");
  const zip = join(stageDir, `ZapretManager_${version}_x64_portable.zip`);

  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });
  copyFileSync(exe, join(stage, "zapret-manager.exe"));

  for (const entry of ["resources", "icons"]) {
    const source = join(releaseDir, entry);

    if (existsSync(source)) {
      cpSync(source, join(stage, entry), { recursive: true });
    }
  }

  if (process.platform === "win32") {
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Compress-Archive -Path '${stage}\\*' -DestinationPath '${zip}' -Force`,
      ],
      { stdio: "ignore" }
    );
  } else {
    execFileSync("zip", ["-qr", zip, "."], { cwd: stage, stdio: "ignore" });
  }

  rmSync(stage, { recursive: true, force: true });

  console.log(`portable: ${zip} (exe + resources + icons)`);

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
