import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const PLACEHOLDER = "USER/zapret-manager";
const USAGE =
  "Использование: node scripts/set-repository-url.mjs <owner/name>\nПример: node scripts/set-repository-url.mjs my-account/zapret-manager";

const raw = process.argv[2]?.trim() ?? "";

if (!raw) {
  console.error(USAGE);
  process.exit(2);
}

if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/.test(raw)) {
  console.error(
    `Некорректный адрес: ${raw}\nОжидается owner/name, например my-account/zapret-manager`
  );
  process.exit(2);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const repoRoot = resolve(appRoot, "..");
const repoUrl = `https://github.com/${raw}`;

const targets = [
  { path: join(appRoot, "src/lib/constants.ts"), label: "APP_REPOSITORY_URL" },
  { path: join(repoRoot, "README.md"), label: "README" },
  { path: join(repoRoot, "CHANGELOG.md"), label: "CHANGELOG" },
  {
    path: join(repoRoot, ".github/ISSUE_TEMPLATE/config.yml"),
    label: "ISSUE_TEMPLATE",
  },
];

let changed = 0;
const touchedPaths = [];

for (const target of targets) {
  if (!existsSync(target.path)) {
    console.log(`пропущено, файла нет: ${target.label}`);
    continue;
  }

  const content = readFileSync(target.path, "utf8");

  if (!content.includes(PLACEHOLDER)) {
    console.log(`без изменений: ${target.label}`);
    continue;
  }

  writeFileSync(target.path, content.split(PLACEHOLDER).join(raw), "utf8");
  changed += 1;
  touchedPaths.push(target.path);
  console.log(`обновлено: ${target.label}`);
}

console.log(`\nРепозиторий: ${repoUrl}`);
console.log(`Изменено файлов: ${changed}`);

const touched = touchedPaths.filter(existsSync);

if (touched.length > 0) {
  const prettier = spawnSync(
    process.execPath,
    [
      join(appRoot, "node_modules/prettier/bin/prettier.cjs"),
      "--write",
      ...touched,
    ],
    { cwd: appRoot, stdio: "inherit" }
  );

  if (prettier.status !== 0) {
    console.error(
      "Не удалось отформатировать изменённые файлы (prettier завершился с ошибкой)"
    );
    process.exitCode = 1;
  }
}

const check = spawnSync(
  process.execPath,
  [join(scriptDir, "check-release-metadata.mjs")],
  {
    cwd: appRoot,
    stdio: "inherit",
  }
);

process.exitCode = check.status ?? 1;
