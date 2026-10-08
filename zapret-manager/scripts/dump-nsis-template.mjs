import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const output =
  process.argv[2] ??
  resolve(process.cwd(), "src-tauri", "installer", "upstream-template.nsi");
const pnpmDir = resolve(process.cwd(), "node_modules", ".pnpm");

if (!existsSync(pnpmDir)) {
  process.stdout.write(`pnpm store not found: ${pnpmDir}\n`);
  process.exit(1);
}

function findCliBinary() {
  const packages = readdirSync(pnpmDir).filter((name) =>
    name.startsWith("@tauri-apps+cli-")
  );
  for (const pkg of packages) {
    const base = resolve(pnpmDir, pkg, "node_modules");
    if (!existsSync(base)) {
      continue;
    }
    const stack = [base];
    while (stack.length > 0) {
      const dir = stack.pop();
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = resolve(dir, entry.name);
        if (entry.isDirectory()) {
          stack.push(path);
          continue;
        }
        if (entry.name.endsWith(".node") || entry.name.endsWith(".exe")) {
          return path;
        }
      }
    }
  }
  return "";
}

function extractTemplate(buffer) {
  const crlf = Buffer.from("Unicode true\r\nManifestDPIAware true", "latin1");
  const lf = Buffer.from("Unicode true\nManifestDPIAware true", "latin1");

  let start = buffer.indexOf(crlf);
  if (start === -1) {
    start = buffer.indexOf(lf);
  }
  if (start === -1) {
    throw new Error(
      "installer template start marker not found in the CLI binary"
    );
  }

  const anchor = buffer.indexOf(
    Buffer.from('CreateShortcut "$DESKTOP\\${PRODUCTNAME}.lnk"', "latin1"),
    start
  );
  if (anchor === -1) {
    throw new Error("desktop shortcut block not found in the CLI binary");
  }

  const endMarker = buffer.indexOf(
    Buffer.from("\r\nFunctionEnd", "latin1"),
    anchor
  );
  if (endMarker === -1) {
    throw new Error(
      "end of the installer template not found in the CLI binary"
    );
  }

  return buffer
    .subarray(start, endMarker + "\r\nFunctionEnd".length)
    .toString("latin1");
}

const binaryPath = findCliBinary();
if (binaryPath === "") {
  process.stdout.write(
    "Tauri CLI native binary not found under node_modules/.pnpm\n"
  );
  process.exit(1);
}

const template = extractTemplate(readFileSync(binaryPath));
writeFileSync(output, template, "latin1");
process.stdout.write(
  `upstream template: ${template.split(/\r\n/).length} lines, ${template.length} bytes\n` +
    `  from ${binaryPath}\n  to   ${output}\n`
);
