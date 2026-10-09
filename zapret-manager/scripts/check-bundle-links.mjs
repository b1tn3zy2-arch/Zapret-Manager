import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const distDir = join(root, "dist");

/**
 * Ссылки, которые не должны попасть в поставляемое приложение:
 * - issues upstream-репозитория zapret: баг-репорт ушёл бы в чужой проект;
 * - незаполненный `USER/` или тестовый `my-account`: ссылка ведёт в никуда.
 */
const FORBIDDEN = [
  {
    marker: "github.com/Flowseal/zapret-discord-youtube/issues",
    reason: "ссылка на issues upstream-репозитория zapret",
  },
  {
    marker: "USER/zapret-manager",
    reason: "незаполненный плейсхолдер репозитория",
  },
  {
    marker: "github.com/my-account",
    reason: "тестовое значение вместо реального адреса",
  },
];

if (!existsSync(distDir)) {
  console.error("dist/ не найден — сначала соберите фронтенд: pnpm build");
  process.exit(1);
}

const files = readdirSync(distDir, { recursive: true })
  .map((entry) => join(distDir, String(entry)))
  .filter((path) => path.endsWith(".js") || path.endsWith(".css"));

if (files.length === 0) {
  console.error("dist/ не содержит собранного бандла (.js/.css)");
  process.exit(1);
}

const problems = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const name = file.slice(root.length + 1);

  for (const { marker, reason } of FORBIDDEN) {
    if (content.includes(marker)) {
      problems.push(`${name}: ${reason} (${marker})`);
    }
  }
}

if (problems.length > 0) {
  console.error("В собранном бандле есть ссылки, которые ведут не туда:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error("\nПересоберите фронтенд: pnpm build");
  process.exitCode = 1;
} else {
  console.log(`Ссылки в собранном бандле в порядке (${files.length} файл.)`);
}
