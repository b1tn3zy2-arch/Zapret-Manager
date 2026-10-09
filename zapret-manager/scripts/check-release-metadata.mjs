import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

/** Ссылка на issues репозитория zapret: баг-репорт приложения ушёл бы в чужой проект. */
const UPSTREAM_ISSUES = "github.com/Flowseal/zapret-discord-youtube/issues";

const pkg = JSON.parse(read("package.json"));
const tauriConf = JSON.parse(read("src-tauri/tauri.conf.json"));
const cargo = read("src-tauri/Cargo.toml");
const constants = read("src/lib/constants.ts");
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

const changelog = read("../CHANGELOG.md");

check(
  changelog !== null && changelog.includes(`## [${version}]`),
  `в CHANGELOG.md нет секции [${version}]`
);

// Приложение не публикуется, поэтому в README и CHANGELOG не должно быть ссылок,
// которые обещают релиз, билд CI или баг-репорты в несуществующем репозитории.
for (const [name, content] of [
  ["README.md", read("../README.md")],
  ["CHANGELOG.md", changelog],
]) {
  if (content === null) {
    problems.push(`${name} не найден`);
    continue;
  }
  if (content.includes(UPSTREAM_ISSUES)) {
    problems.push(
      `${name} отправляет баг-репорты в upstream-репозиторий zapret`
    );
  }
  for (const marker of ["USER/zapret-manager", "github.com/my-account"]) {
    if (content.includes(marker)) {
      problems.push(
        `${name} содержит незаполненную или тестовую ссылку ${marker}`
      );
    }
  }
}

if (problems.length > 0) {
  console.error("Метаданные релиза требуют правки:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Метаданные релиза в порядке (версия ${version})`);
}
