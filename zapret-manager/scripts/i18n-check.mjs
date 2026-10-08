import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const BASELINE = Number(process.env.I18N_BASELINE ?? "0");

const IGNORED_FILES = [
  "src/i18n",
  "src/lib/constants.ts",
  "src/lib/rarity.ts",
  "src/lib/settingsConstants.ts",
  "src/lib/defaults.ts",
  "src/stores/mocks",
  "src/lib/validators.ts",
];

const IGNORED_SUFFIXES = [".test.ts", ".test.tsx"];

function walk(directory) {
  const entries = readdirSync(directory);

  return entries.flatMap((entry) => {
    const full = join(directory, entry);

    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function isIgnored(relativePath) {
  if (IGNORED_SUFFIXES.some((suffix) => relativePath.endsWith(suffix))) {
    return true;
  }

  return IGNORED_FILES.some((prefix) => relativePath.startsWith(prefix));
}

const CYRILLIC = /[\u0400-\u04FF]/u;
const files = walk(SRC);
const findings = [];

for (const file of files) {
  const relativePath = relative(ROOT, file).replaceAll("\\", "/");

  if (isIgnored(relativePath)) {
    continue;
  }

  const lines = readFileSync(file, "utf8").split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    const strings = line.match(/"[^"\r\n]*"/gu) ?? [];
    const hasCyrillic = strings.some((value) => CYRILLIC.test(value));

    if (hasCyrillic) {
      findings.push({ file: relativePath, line: index + 1 });
    }
  }
}

process.stdout.write(`hardcoded ru strings: ${findings.length}\n`);

if (findings.length > 0) {
  const byFile = new Map();

  for (const finding of findings) {
    byFile.set(finding.file, (byFile.get(finding.file) ?? 0) + 1);
  }

  const top = [...byFile.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10);

  for (const [file, count] of top) {
    process.stdout.write(`  ${file}: ${count}\n`);
  }
}

if (BASELINE > 0 && findings.length > BASELINE) {
  process.stdout.write(
    `FAIL: hardcoded strings grew from ${BASELINE} to ${findings.length}\n`
  );
  process.exitCode = 1;
} else {
  process.stdout.write("PASS: no growth of hardcoded strings\n");
}
