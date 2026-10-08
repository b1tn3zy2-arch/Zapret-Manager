import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const RUST_SRC = path.join(ROOT, "src-tauri", "src");
const SKIP_DIRS = new Set(["node_modules", "dist", "target", "gen", ".git"]);

const FORBIDDEN_PATTERNS = [
  { name: "dangerouslySetInnerHTML", pattern: /dangerouslySetInnerHTML/ },
  { name: "eval(", pattern: /\beval\s*\(/ },
  { name: "new Function(", pattern: /new\s+Function\s*\(/ },
  { name: "innerHTML =", pattern: /\.innerHTML\s*=/ },
  { name: "document.write", pattern: /document\.write\s*\(/ },
  {
    name: "http:// in source",
    pattern: /http:\/\/(?!localhost|ipc\.localhost|www\.w3\.org)/,
  },
];

const RUST_PATTERNS = [
  { name: "unwrap()", pattern: /\.unwrap\s*\(\s*\)/ },
  { name: "expect()", pattern: /\.expect\s*\(\s*"[^"]*"\s*\)/ },
  { name: "panic!()", pattern: /\bpanic!\s*\(/ },
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }

      files.push(...(await walk(path.join(dir, entry.name))));
      continue;
    }

    files.push(path.join(dir, entry.name));
  }

  return files;
}

async function scanFiles(dir, patterns, extensions) {
  const files = (await walk(dir)).filter((file) =>
    extensions.some((extension) => file.endsWith(extension))
  );
  const findings = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const lines = content.split("\n");
    let inTestBlock = false;

    lines.forEach((line, index) => {
      if (line.includes("#[cfg(test)]")) {
        inTestBlock = true;
      }

      if (inTestBlock) {
        return;
      }

      for (const { name, pattern } of patterns) {
        if (pattern.test(line)) {
          findings.push({
            file: path.relative(ROOT, file),
            line: index + 1,
            name,
            text: line.trim().slice(0, 120),
          });
        }
      }
    });
  }

  return findings;
}

async function main() {
  console.log("security-audit: поиск опасных конструкций в src/");

  const frontend = await scanFiles(SRC, FORBIDDEN_PATTERNS, [".ts", ".tsx"]);

  if (frontend.length > 0) {
    console.error("");
    console.error("Найдены запрещённые конструкции:");
    for (const item of frontend) {
      console.error(`  ${item.file}:${item.line} ${item.name} — ${item.text}`);
    }
    process.exit(1);
  }

  console.log("  src: чисто");

  console.log("security-audit: unwrap/expect/panic в src-tauri/src");

  const rust = await scanFiles(RUST_SRC, RUST_PATTERNS, [".rs"]);
  const inTests = rust.filter(
    (item) => item.file.endsWith("_tests.rs") || item.file.includes("tests")
  );
  const inProduction = rust.filter((item) => !inTests.includes(item));

  if (inProduction.length > 0) {
    console.error("");
    console.error("Найдены panic-конструкции в production-коде:");
    for (const item of inProduction) {
      console.error(`  ${item.file}:${item.line} ${item.name} — ${item.text}`);
    }
    process.exit(1);
  }

  console.log(`  src-tauri: чисто (в тестах: ${inTests.length})`);

  const capabilities = JSON.parse(
    await readFile(
      path.join(ROOT, "src-tauri", "capabilities", "default.json"),
      "utf8"
    )
  );

  const wildcard = capabilities.permissions.filter((permission) =>
    permission.includes("*")
  );

  if (wildcard.length > 0) {
    console.error(`capabilities: найдены wildcard-разрешения: ${wildcard}`);
    process.exit(1);
  }

  console.log(
    `security-audit: capabilities — ${capabilities.permissions.length} разрешений, wildcard нет`
  );

  const config = JSON.parse(
    await readFile(path.join(ROOT, "src-tauri", "tauri.conf.json"), "utf8")
  );
  const csp = config.app.security.csp;

  const required = [
    "default-src 'self'",
    "script-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ];
  const missing = required.filter((rule) => !csp.includes(rule));

  if (missing.length > 0) {
    console.error(`CSP: отсутствуют директивы ${missing.join(", ")}`);
    process.exit(1);
  }

  if (csp.includes("script-src 'self' 'unsafe-inline'")) {
    console.error("CSP: unsafe-inline в script-src запрещён");
    process.exit(1);
  }

  console.log("security-audit: CSP содержит обязательные директивы");
  console.log("");
  console.log("Все проверки безопасности пройдены");
}

await main();
