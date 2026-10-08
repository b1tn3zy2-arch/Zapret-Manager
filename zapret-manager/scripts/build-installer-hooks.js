import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const installerDir = resolve(scriptDir, "..", "src-tauri", "installer");

const sources = [
  "languages\\russian.nsh",
  "languages\\english.nsh",
  "include\\Variables.nsh",
  "include\\Logging.nsh",
  "include\\Checks.nsh",
  "include\\Pages.nsh",
  "include\\Components.nsh",
  "include\\Finish.nsh",
  "include\\Hooks.nsh",
];

const header = [
  "; Zapret Manager - NSIS installer hooks and custom pages.",
  "; GENERATED FILE - do not edit it, edit the sources and run `pnpm run installer:hooks`.",
  "; Sources:",
  ...sources.map((source) => `;   ${source}`),
  ";",
  "; Tauri includes this single file by absolute path (bundle > windows > nsis > installerHooks).",
  "; NSIS resolves relative !include paths against the directory of the rendered installer",
  "; script, not against this file, so every installer source is inlined here.",
  "",
].join("\r\n");

const body = sources
  .map((source) => {
    const content = readFileSync(resolve(installerDir, source), "utf8").replace(
      /^\uFEFF/,
      ""
    );
    const badDirective = content.match(/^\s*;[a-z]+/im);
    if (badDirective) {
      throw new Error(
        `${source}: NSIS directives must start with "!" (found "${badDirective[0].trim()}")`
      );
    }
    return `; ---------------------------------------------------------------- ${source}\r\n${content.replace(/\s+$/, "")}\r\n`;
  })
  .join("\r\n");

const target = resolve(installerDir, "hooks.nsh");
const output = `${header}${body}`;
const utf8Bom = `\uFEFF${output}`;

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(target, "utf8");
  } catch {
    current = "";
  }
  if (current === utf8Bom) {
    process.stdout.write("hooks.nsh is up to date\n");
    process.exit(0);
  }
  process.stdout.write("hooks.nsh is stale, run `pnpm run installer:hooks`\n");
  process.exit(1);
}

writeFileSync(target, utf8Bom, "utf8");
process.stdout.write(
  `hooks.nsh: ${sources.length} sources, ${output.length} bytes -> ${target}\n`
);
