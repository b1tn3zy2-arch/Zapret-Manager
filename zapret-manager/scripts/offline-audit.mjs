import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

const ALLOWED_HOSTS = new Set([
  "api.github.com",
  "cdn.cloudflare.steamstatic.com",
  "github.com",
  "objects.githubusercontent.com",
  "raw.githubusercontent.com",
  "freeipapi.com",
  "ipapi.co",
  "ipwho.is",
  "www.w3.org",
  "wireguard.com",
  "www.wireguard.com",
  "example.com",
  "example.test",
  "evil.example.com",
  "sub.example.com",
]);

const IGNORED_PATHS = ["src/assets/flags", "src/i18n/", "src-tauri/target"];

const IGNORED_SUFFIXES = [".test.ts", ".test.tsx", "_tests.rs", ".svg"];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const full = join(directory, entry);

    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function isIgnored(relativePath) {
  if (IGNORED_SUFFIXES.some((suffix) => relativePath.endsWith(suffix))) {
    return true;
  }

  return IGNORED_PATHS.some((prefix) => relativePath.startsWith(prefix));
}

const URL_PATTERN = /https?:\/\/[^\s"'`)>]+/g;
const findings = [];
const allowedSeen = new Set();

const roots = [join(ROOT, "src"), join(ROOT, "src-tauri", "src")];

for (const root of roots) {
  for (const file of walk(root)) {
    const relativePath = relative(ROOT, file).replaceAll("\\", "/");

    if (isIgnored(relativePath)) {
      continue;
    }

    const text = readFileSync(file, "utf8");

    for (const match of text.matchAll(URL_PATTERN)) {
      const url = match[0];
      const host = new URL(url).hostname;

      if (ALLOWED_HOSTS.has(host)) {
        allowedSeen.add(host);
        continue;
      }

      findings.push({ file: relativePath, url });
    }

    if (/@import\s+url\(\s*["']?https?:/i.test(text)) {
      findings.push({ file: relativePath, url: "@import url(http...)" });
    }

    if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(text)) {
      findings.push({ file: relativePath, url: "google fonts" });
    }

    if (/cdn\.jsdelivr|cdnjs\.cloudflare|unpkg\.com/i.test(text)) {
      findings.push({ file: relativePath, url: "external cdn" });
    }
  }
}

process.stdout.write(
  `allowed hosts used: ${[...allowedSeen].sort().join(", ") || "none"}\n`
);
process.stdout.write(`unexpected urls: ${findings.length}\n`);

for (const finding of findings.slice(0, 30)) {
  process.stdout.write(`  ${finding.file}: ${finding.url}\n`);
}

if (findings.length > 0) {
  process.stdout.write(
    "FAIL: offline-first audit found unexpected external URLs\n"
  );
  process.exitCode = 1;
} else {
  process.stdout.write("PASS: no unexpected external URLs\n");
}
