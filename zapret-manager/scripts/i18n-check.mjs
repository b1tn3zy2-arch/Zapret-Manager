import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const ENFORCED_PREFIXES = [
  "src/components/",
  "src/pages/",
  "src/tray/",
  "src/hooks/",
  "src/lib/",
  "src/App.tsx",
];

const ALLOWED_FILES = [
  "src/lib/format.ts",
  "src/lib/trafficUtils.ts",
  "src/lib/resources.ts",
  "src/lib/pingUtils.ts",
  "src/hooks/useStrategyRunner.ts",
];

const IGNORED_SUFFIXES = [".test.ts", ".test.tsx"];

function walk(directory) {
  const entries = readdirSync(directory);

  return entries.flatMap((entry) => {
    const full = join(directory, entry);

    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function loadDictionary(name) {
  const path = join(SRC, "i18n", `${name}.ts`);
  const text = readFileSync(path, "utf8");
  const start = text.indexOf("export const");
  const bodyStart = text.indexOf("{", start);
  const bodyEnd = text.lastIndexOf("};");
  const literal = text.slice(bodyStart, bodyEnd + 1);
  const factory = new Function(`"use strict"; return (${literal});`);

  return factory();
}

function flattenKeys(value, prefix, target) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix === "" ? key : `${prefix}.${key}`;

    if (typeof child === "string") {
      target.add(path);
    } else if (typeof child === "object" && child !== null) {
      flattenKeys(child, path, target);
    }
  }
}

const ruKeys = new Set();
const enKeys = new Set();

flattenKeys(loadDictionary("ru"), "", ruKeys);
flattenKeys(loadDictionary("en"), "", enKeys);

const missingInEn = [...ruKeys].filter((key) => !enKeys.has(key));
const missingInRu = [...enKeys].filter((key) => !ruKeys.has(key));

const CYRILLIC = /\p{Script=Cyrillic}/u;
const findings = [];

for (const file of walk(SRC)) {
  const relativePath = relative(ROOT, file).replaceAll("\\", "/");
  const enforced = ENFORCED_PREFIXES.some((prefix) =>
    relativePath.startsWith(prefix)
  );

  if (
    !enforced ||
    ALLOWED_FILES.includes(relativePath) ||
    IGNORED_SUFFIXES.some((suffix) => relativePath.endsWith(suffix))
  ) {
    continue;
  }

  const lines = readFileSync(file, "utf8").split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    const strings = line.match(/"[^"\r\n]*"|'[^'\r\n]*'|`[^`\r\n]*`/gu) ?? [];

    if (strings.some((value) => CYRILLIC.test(value))) {
      findings.push({ file: relativePath, line: index + 1 });
    }
  }
}

process.stdout.write(`missing keys in en: ${missingInEn.length}\n`);

for (const key of missingInEn.slice(0, 20)) {
  process.stdout.write(`  ru only: ${key}\n`);
}

process.stdout.write(`missing keys in ru: ${missingInRu.length}\n`);

for (const key of missingInRu.slice(0, 20)) {
  process.stdout.write(`  en only: ${key}\n`);
}

process.stdout.write(`hardcoded ru strings in UI: ${findings.length}\n`);

for (const finding of findings.slice(0, 30)) {
  process.stdout.write(`  ${finding.file}:${finding.line}\n`);
}

const failed =
  missingInEn.length > 0 || missingInRu.length > 0 || findings.length > 0;

if (failed) {
  process.stdout.write(`FAIL: ${basename(import.meta.url)} found issues\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("PASS: i18n dictionaries and UI strings are clean\n");
}
