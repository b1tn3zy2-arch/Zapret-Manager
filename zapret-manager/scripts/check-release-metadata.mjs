import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const problems = [];
const warnings = [];

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

if (changelog !== null) {
  check(
    changelog.includes(`## [${version}]`),
    `в CHANGELOG.md нет секции [${version}]`
  );
}

// Приложение не публикуется, поэтому в README и CHANGELOG не должно быть ссылок,
// которые обещают релиз, билд CI или баг-репорты в несуществующем репозитории.
for (const [name, content] of [
  ["README.md", read("../README.md")],
  ["CHANGELOG.md", changelog],
]) {
  if (content === null) {
    // файлы удалены намеренно: отсутствие не ломает сборку, но о нём стоит знать
    warnings.push(`${name} отсутствует — проверка ссылок пропущена`);
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

if (warnings.length > 0) {
  for (const warning of warnings) {
    console.warn(`Предупреждение: ${warning}`);
  }
}

/**
 * Отдаваемые файлы в release/ не должны быть старее свежей сборки.
 *
 * Раньше каталог наполнялся отдельной командой release:artifacts, и её легко
 * забыть вызвать: сборка собирала новые установщики в
 * src-tauri/target/release/bundle, а release/ оставался с прошлого раза.
 * Установка такого установщика молча оставляла старую сборку, и правки
 * в приложении не появлялись вообще.
 */
const bundleToStaged = [
  ["src-tauri/target/release/bundle/nsis", "release"],
  ["src-tauri/target/release/bundle/msi", "release"],
];

for (const [bundleDir, stageDir] of bundleToStaged) {
  const bundlePath = join(root, bundleDir);
  const stagePath = join(root, stageDir);

  if (!existsSync(bundlePath) || !existsSync(stagePath)) {
    continue;
  }

  for (const name of readdirSync(bundlePath)) {
    if (!/\.(exe|msi)$/i.test(name)) {
      continue;
    }

    const fresh = statSync(join(bundlePath, name)).mtimeMs;
    const stagedPath = join(stagePath, name);

    if (!existsSync(stagedPath)) {
      problems.push(
        `${name} собран, но не отдан в release/ — запусти release:artifacts`
      );
      continue;
    }

    if (statSync(stagedPath).mtimeMs < fresh) {
      problems.push(
        `${name} в release/ старее свежей сборки — запусти release:artifacts, иначе установится старый битд`
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
