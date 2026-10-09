import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  bareRepo,
  checkBundleFile,
  checkBundleFreshness,
  collectBundleFiles,
  extractRepoUrl,
} from "./lib/release-metadata.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const distDir = join(root, "dist");
const problems = [];
const allowPlaceholder = process.env.ALLOW_PLACEHOLDER_REPO === "1";

if (allowPlaceholder) {
  console.warn(
    "ВНИМАНИЕ: ALLOW_PLACEHOLDER_REPO=1 — placeholder в локальном бандле разрешён. CI и release.yml эту переменную не задают."
  );
}

if (!existsSync(distDir)) {
  console.error("dist/ не найден — сначала соберите фронтенд: pnpm build");
  process.exit(1);
}

const constants = readFileSync(join(root, "src/lib/constants.ts"), "utf8");
const repoUrl = extractRepoUrl(constants);
const files = collectBundleFiles(distDir);

if (files.length === 0) {
  problems.push("dist/ не содержит собранного бандла (.js/.css)");
}

for (const file of files) {
  problems.push(
    ...checkBundleFile(
      {
        name: file.slice(root.length + 1),
        content: readFileSync(file, "utf8"),
      },
      { allowPlaceholder }
    )
  );
}

problems.push(
  ...checkBundleFreshness(
    files.map((file) => readFileSync(file, "utf8")).join("\n"),
    repoUrl,
    { allowPlaceholder }
  )
);

if (problems.length > 0) {
  console.error("Собранный бандл не соответствует исходникам:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Ссылки в собранном бандле в порядке (${files.length} файл., репозиторий ${bareRepo(repoUrl)})`
  );
}
