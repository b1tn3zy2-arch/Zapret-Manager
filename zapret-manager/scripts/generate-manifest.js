import { createHash } from "node:crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, "..");
const RESOURCES_DIR = join(ROOT, "src-tauri", "resources");
const MANIFEST_PATH = join(RESOURCES_DIR, "manifest.json");
const VERSION_FILE = join(RESOURCES_DIR, "zapret", "service.bat");
const MANIFEST_NAME = "manifest.json";

const HASH_PREFIX = "sha256:";
const SKIP_DIRS = new Set(["backups", "cache"]);
const TEXT_EXTENSIONS = new Set([".bat", ".txt", ".md", ".json"]);

function isTextFile(path) {
  return TEXT_EXTENSIONS.has(extname(path));
}

function extname(path) {
  const index = path.lastIndexOf(".");

  return index === -1 ? "" : path.slice(index).toLowerCase();
}

function hashFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function readVersion() {
  if (!existsSync(VERSION_FILE)) {
    throw new Error(`Не найден ${VERSION_FILE}`);
  }

  const match = readFileSync(VERSION_FILE, "utf8").match(
    /LOCAL_VERSION=([^\r\n"]+)/
  );

  if (match === null || match[1] === undefined) {
    throw new Error("В service.bat нет строки LOCAL_VERSION");
  }

  return match[1].trim();
}

function walk(dir, files) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (SKIP_DIRS.has(entry)) {
      continue;
    }

    if (statSync(full).isDirectory()) {
      walk(full, files);
      continue;
    }

    files.push(full);
  }
}

function toManifestKey(path) {
  return relative(RESOURCES_DIR, path).split(sep).join("/");
}

function build() {
  if (!existsSync(RESOURCES_DIR)) {
    throw new Error(`Не найдена папка ${RESOURCES_DIR}`);
  }

  const all = [];
  walk(RESOURCES_DIR, all);

  const files = {};
  let skipped = 0;

  for (const path of all) {
    const key = toManifestKey(path);

    if (key === MANIFEST_NAME) {
      continue;
    }

    if (!isTextFile(path)) {
      skipped += 1;
      continue;
    }

    files[key] = `${HASH_PREFIX}${hashFile(path)}`;
  }

  const sorted = {};
  for (const key of Object.keys(files).sort()) {
    sorted[key] = files[key];
  }

  return {
    manifest: {
      version: readVersion(),
      generatedAt: Date.now(),
      files: sorted,
    },
    skipped,
    total: Object.keys(sorted).length,
  };
}

function main() {
  const { manifest, skipped, total } = build();

  writeFileSync(
    MANIFEST_PATH,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );

  process.stdout.write(
    `manifest.json: версия ${manifest.version}, ${total} файлов, ` +
      `пропущено бинарных ${skipped}\n`
  );
}

main();
