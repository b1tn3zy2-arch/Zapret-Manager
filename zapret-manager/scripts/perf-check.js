import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import process from "node:process";

const DIST_DIR = path.resolve("dist/assets");

const LIMITS = {
  jsTotalKbGzip: 400,
  cssKbGzip: 50,
  mainChunkKbGzip: 200,
};

function toKb(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

async function listAssets(extension) {
  const entries = await readdir(DIST_DIR);
  return entries.filter((entry) => entry.endsWith(extension));
}

async function gzipSize(filePath) {
  const content = await readFile(filePath);
  return gzipSync(content, { level: 9 }).length;
}

async function measure() {
  const jsFiles = await listAssets(".js");
  const cssFiles = await listAssets(".css");

  const js = [];
  for (const file of jsFiles) {
    const filePath = path.join(DIST_DIR, file);
    const [raw, gz] = await Promise.all([stat(filePath), gzipSize(filePath)]);
    js.push({ file, raw: raw.size, gzip: gz });
  }

  const css = [];
  for (const file of cssFiles) {
    const filePath = path.join(DIST_DIR, file);
    const [raw, gz] = await Promise.all([stat(filePath), gzipSize(filePath)]);
    css.push({ file, raw: raw.size, gzip: gz });
  }

  return { js, css };
}

function sumGzip(files) {
  return files.reduce((total, file) => total + file.gzip, 0);
}

function findMainChunk(files) {
  return (
    files.find((file) => file.file.startsWith("index-")) ??
    files.reduce((largest, file) => (file.gzip > largest.gzip ? file : largest))
  );
}

async function main() {
  const { js, css } = await measure();
  const jsTotalGzip = sumGzip(js);
  const cssTotalGzip = sumGzip(css);
  const mainChunk = findMainChunk(js);

  console.log("chunk                                  raw KB   gzip KB");
  for (const file of [...js, ...css].sort((a, b) => b.gzip - a.gzip)) {
    console.log(
      `${file.file.padEnd(38)} ${toKb(file.raw).toFixed(1).padStart(7)} ${toKb(
        file.gzip
      )
        .toFixed(1)
        .padStart(9)}`
    );
  }

  console.log("");
  console.log(
    `js total (gzip):   ${toKb(jsTotalGzip)} KB  / ${LIMITS.jsTotalKbGzip} KB`
  );
  console.log(
    `css total (gzip):  ${toKb(cssTotalGzip)} KB  / ${LIMITS.cssKbGzip} KB`
  );
  console.log(
    `main chunk (gzip): ${toKb(mainChunk.gzip)} KB  / ${LIMITS.mainChunkKbGzip} KB`
  );

  const failures = [];

  if (jsTotalGzip / 1024 > LIMITS.jsTotalKbGzip) {
    failures.push(
      `js total ${toKb(jsTotalGzip)} KB > ${LIMITS.jsTotalKbGzip} KB`
    );
  }

  if (cssTotalGzip / 1024 > LIMITS.cssKbGzip) {
    failures.push(
      `css total ${toKb(cssTotalGzip)} KB > ${LIMITS.cssKbGzip} KB`
    );
  }

  if (mainChunk.gzip / 1024 > LIMITS.mainChunkKbGzip) {
    failures.push(
      `main chunk ${toKb(mainChunk.gzip)} KB > ${LIMITS.mainChunkKbGzip} KB`
    );
  }

  if (failures.length > 0) {
    console.error("");
    console.error("perf-check failed:");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log("");
  console.log("perf-check passed");
}

await main();
