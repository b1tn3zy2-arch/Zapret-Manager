import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..", "..");
const changelogPath = join(root, "CHANGELOG.md");

const rawVersion = process.argv[2];
const outputPath = process.argv[3];

if (rawVersion === undefined) {
  console.error("usage: node scripts/extract-changelog.mjs <version> [output]");
  process.exit(1);
}

if (!existsSync(changelogPath)) {
  console.error(`CHANGELOG не найден: ${changelogPath}`);
  process.exit(1);
}

const version = rawVersion.replace(/^v/, "");

if (!/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`Некорректная версия: ${rawVersion}`);
  process.exit(1);
}

const changelog = readFileSync(changelogPath, "utf8");
const lines = changelog.split(/\r?\n/);
const collected = [];
let capturing = false;

for (const line of lines) {
  if (/^\[[^\]]+\]:/.test(line)) {
    break;
  }

  if (line.startsWith("## [")) {
    if (capturing) {
      break;
    }

    capturing = line.startsWith(`## [${version}]`);

    if (capturing) {
      continue;
    }
  }

  if (capturing) {
    collected.push(line);
  }
}

const body = collected.join("\n").trim();

if (body === "") {
  console.error(`В CHANGELOG.md нет непустой секции для версии ${version}`);
  process.exit(1);
}

if (outputPath !== undefined) {
  writeFileSync(outputPath, `${body}\n`, "utf8");
  console.log(`Секция ${version} записана в ${outputPath}`);
} else {
  process.stdout.write(`${body}\n`);
}
