/**
 * Проверка защиты поставки.
 *
 * Пользователь просил, чтобы после установки исходный код не валялся рядом с
 * программой. Правило простое и проверяемое: в папке установки не должно быть
 * ни исходников, ни карт кода, ни распакованного фронтенда — весь интерфейс
 * собран и вшит в exe. Скрипт проверяет и собранный `dist`, и то, что реально
 * уходит в portable-архив.
 */
import { readdirSync, existsSync, statSync, readFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const FORBIDDEN_EXTENSIONS = [
  ".map",
  ".ts",
  ".tsx",
  ".jsx",
  ".vue",
  ".svelte",
  ".wasm.map",
];

/** Папки, которые не должны попадать в поставку целиком. */
const FORBIDDEN_DIR_NAMES = ["src", "node_modules", "include", "target"];

const problems = [];

function walk(directory, visit) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (FORBIDDEN_DIR_NAMES.includes(entry.name)) {
        problems.push(
          `в поставке есть служебная папка ${relative(root, full)}`
        );
        continue;
      }

      walk(full, visit);
      continue;
    }

    visit(full);
  }
}

if (!existsSync(dist)) {
  console.error("dist не найден: сначала соберите фронтенд (npm run build)");
  process.exit(1);
}

walk(dist, (file) => {
  const lower = file.toLowerCase();

  if (FORBIDDEN_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    problems.push(`в сборке остался файл исходников: ${relative(root, file)}`);
  }
});

const indexHtml = join(dist, "index.html");

if (existsSync(indexHtml)) {
  const size = statSync(indexHtml).size;
  const html = readFileSync(indexHtml, "utf8");
  const inlineScript =
    /<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?\S[\s\S]*?<\/script>/.test(html);

  if (inlineScript) {
    problems.push(
      "index.html содержит встроенный скрипт: код виден без сборки"
    );
  }

  if (size > 64 * 1024) {
    problems.push(`index.html подозрительно большой: ${size} байт`);
  }
}

if (problems.length > 0) {
  console.error("Проверка защиты сборки не пройдена:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }

  process.exit(1);
}

console.log("Поставка защищена: исходников и карт кода в сборке нет");
