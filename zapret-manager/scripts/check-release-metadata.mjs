import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  PLACEHOLDER,
  checkDocument,
  extractRepoUrl,
  isPlaceholder,
} from "./lib/release-metadata.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const problems = [];

function read(relative) {
  const path = join(root, relative);

  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function check(condition, message) {
  if (!condition) {
    problems.push(message);
  }
}

const allowPlaceholder = process.env.ALLOW_PLACEHOLDER_REPO === "1";
const options = { allowPlaceholder };

if (allowPlaceholder) {
  console.warn(
    "ВНИМАНИЕ: ALLOW_PLACEHOLDER_REPO=1 — проверка плейсхолдера отключена. Допустимо только для локальной проверки сборки; CI и release.yml эту переменную не задают."
  );
}

const pkg = JSON.parse(read("package.json"));
const tauriConf = JSON.parse(read("src-tauri/tauri.conf.json"));
const cargo = read("src-tauri/Cargo.toml");
const constants = read("src/lib/constants.ts");
const settingsConstants = read("src/lib/settingsConstants.ts");
const version = pkg.version;

check(
  tauriConf.version === version,
  `версия различается: package.json ${version}, tauri.conf.json ${tauriConf.version}`
);
check(
  cargo !== null && cargo.includes(`version = "${version}"`),
  `версия не найдена в src-tauri/Cargo.toml: ${version}`
);
check(
  constants !== null && constants.includes(`APP_VERSION = "${version}"`),
  `APP_VERSION в src/lib/constants.ts не совпадает с ${version}`
);
check(
  read("../CHANGELOG.md") !== null &&
    read("../CHANGELOG.md").includes(`## [${version}]`),
  `в CHANGELOG.md нет секции [${version}]`
);

const repoUrl = extractRepoUrl(constants);

check(repoUrl !== undefined, "APP_REPOSITORY_URL не найден в constants.ts");

if (!allowPlaceholder) {
  check(
    !isPlaceholder(repoUrl),
    `APP_REPOSITORY_URL всё ещё содержит плейсхолдер: ${repoUrl}`
  );
}

check(
  settingsConstants !== null &&
    settingsConstants.includes("APP_REPOSITORY_URL"),
  "ABOUT_LINKS не использует APP_REPOSITORY_URL"
);

problems.push(
  ...checkDocument("README.md", read("../README.md"), options),
  ...checkDocument("CHANGELOG.md", read("../CHANGELOG.md"), options)
);

if (problems.length > 0) {
  console.error("Метаданные релиза требуют правки:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(
    `\nКак исправить одной командой: pnpm release:repo <owner/name>\nНапример: pnpm release:repo my-account/zapret-manager\nПлейсхолдер в исходниках: ${PLACEHOLDER}`
  );
  process.exitCode = 1;
} else {
  console.log(
    `Метаданные релиза в порядке (версия ${version}, репозиторий ${repoUrl})`
  );
}
