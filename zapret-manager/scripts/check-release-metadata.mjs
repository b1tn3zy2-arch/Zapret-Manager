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

const pkg = JSON.parse(read("package.json"));
const tauriConf = JSON.parse(read("src-tauri/tauri.conf.json"));
const cargo = read("src-tauri/Cargo.toml");
const constants = read("src/lib/constants.ts");
const settingsConstants = read("src/lib/settingsConstants.ts");
const changelog = read("../CHANGELOG.md");
const readme = read("../README.md");

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
  constants !== null &&
    constants.includes(`export const APP_VERSION = "${version}"`),
  `APP_VERSION в src/lib/constants.ts не совпадает с ${version}`
);
check(
  changelog !== null && changelog.includes(`## [${version}]`),
  `в CHANGELOG.md нет секции [${version}]`
);

const repoUrl = constants?.match(/APP_REPOSITORY_URL = "([^"]+)"/)?.[1];

check(repoUrl !== undefined, "APP_REPOSITORY_URL не найден в constants.ts");
check(
  repoUrl !== undefined && !repoUrl.includes("USER/"),
  `APP_REPOSITORY_URL всё ещё содержит плейсхолдер: ${repoUrl}`
);
check(
  settingsConstants !== null &&
    repoUrl !== undefined &&
    settingsConstants.includes("APP_REPOSITORY_URL"),
  "ABOUT_LINKS не использует APP_REPOSITORY_URL"
);

for (const [name, content] of [
  ["README.md", readme],
  ["CHANGELOG.md", changelog],
]) {
  if (content === null) {
    problems.push(`${name} не найден`);
    continue;
  }

  check(
    !content.includes("USER/zapret-manager"),
    `${name} содержит плейсхолдер USER/zapret-manager — укажите реальный репозиторий`
  );
  check(
    !content.includes("github.com/Flowseal/zapret-discord-youtube/issues"),
    `${name} отправляет баг-репорты в upstream-репозиторий zapret`
  );
}

if (problems.length > 0) {
  console.error("Метаданные релиза требуют правки:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(
    "\nКак исправить: замените APP_REPOSITORY_URL в src/lib/constants.ts и ссылки USER/zapret-manager в README.md и CHANGELOG.md на адрес своего репозитория."
  );
  process.exitCode = 1;
} else {
  console.log(
    `Метаданные релиза в порядке (версия ${version}, репозиторий ${repoUrl})`
  );
}
