import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const version = process.argv[2];

if (version === undefined || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Использование: node scripts/bump-version.mjs <X.Y.Z>");
  process.exit(1);
}

const targets = [
  {
    label: "package.json",
    update(content) {
      const parsed = JSON.parse(content);
      parsed.version = version;
      return `${JSON.stringify(parsed, null, 2)}\n`;
    },
  },
  {
    label: "src-tauri/tauri.conf.json",
    update(content) {
      const parsed = JSON.parse(content);
      parsed.version = version;
      return `${JSON.stringify(parsed, null, 2)}\n`;
    },
  },
  {
    label: "src-tauri/Cargo.toml",
    update(content) {
      return content.replace(/^version = "[^"]+"/m, `version = "${version}"`);
    },
  },
  {
    label: "zapret-manager/src/lib/constants.ts",
    update(content) {
      return content.replace(
        /export const APP_VERSION = "[^"]+"/,
        `export const APP_VERSION = "${version}"`
      );
    },
  },
];

for (const target of targets) {
  const path = join(root, target.label);
  const content = readFileSync(path, "utf8");
  writeFileSync(path, target.update(content), "utf8");
  console.log(`обновлено: ${target.label}`);
}

const changelogPath = join(root, "CHANGELOG.md");
const changelog = readFileSync(changelogPath, "utf8");

if (!changelog.includes(`## [${version}]`)) {
  const date = new Date().toISOString().slice(0, 10);
  const section = `## [Unreleased]\n\n## [${version}] - ${date}\n\n### Added\n\n-\n\n### Changed\n\n-\n\n### Fixed\n\n-\n\n`;

  writeFileSync(
    changelogPath,
    changelog.replace("## [Unreleased]\n", section),
    "utf8"
  );
  console.log(`добавлена секция CHANGELOG для ${version}`);
}

console.log(`Версия обновлена до ${version}`);
console.log(
  "Дальше: заполнить CHANGELOG, закоммитить, создать тег v" + version
);
