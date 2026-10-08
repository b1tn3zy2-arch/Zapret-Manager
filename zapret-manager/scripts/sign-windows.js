import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const profile =
  process.env.TAURI_PROFILE === undefined
    ? "release"
    : process.env.TAURI_PROFILE;
const bundleDir = resolve(
  process.cwd(),
  "src-tauri",
  "target",
  profile,
  "bundle",
  "nsis"
);
const signingDir = resolve(process.cwd(), ".signing");

const certificate = process.env.CERTIFICATE_PATH ?? "";
const password = process.env.CERTIFICATE_PASSWORD ?? "";
const timestampUrl =
  process.env.CERTIFICATE_TIMESTAMP_URL ?? "http://timestamp.digicert.com";

const signtool = process.env.SIGNTOOL_PATH ?? findSignTool();

function findSignTool() {
  if (process.platform !== "win32") {
    return "";
  }
  const roots = [
    process.env["ProgramFiles(x86)"],
    process.env.ProgramFiles,
    process.env.LOCALAPPDATA,
  ].filter((value) => typeof value === "string" && value !== "");

  for (const root of roots) {
    const kit = resolve(root, "Windows Kits", "10", "bin");
    if (!existsSync(kit)) {
      continue;
    }
    const versions = readdirSync(kit)
      .filter((name) => /^10\./.test(name))
      .sort()
      .reverse();
    for (const version of versions) {
      for (const arch of ["x64", "x86"]) {
        const candidate = resolve(kit, version, arch, "signtool.exe");
        if (existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }
  return "";
}

function listArtifacts() {
  if (!existsSync(bundleDir)) {
    return [];
  }
  return readdirSync(bundleDir)
    .filter((name) => name.toLowerCase().endsWith(".exe"))
    .map((name) => resolve(bundleDir, name));
}

if (!existsSync(bundleDir)) {
  process.stdout.write(
    `bundle directory not found: ${bundleDir}\nrun \`pnpm tauri build\` first\n`
  );
  process.exit(1);
}

const artifacts = listArtifacts();
if (artifacts.length === 0) {
  process.stdout.write(`no .exe artifacts in ${bundleDir}\n`);
  process.exit(1);
}

if (certificate === "" || !existsSync(certificate)) {
  process.stdout.write("certificate not provided, nothing to sign\n");
  process.stdout.write(
    "set CERTIFICATE_PATH and CERTIFICATE_PASSWORD to sign the installer\n"
  );
  process.stdout.write(
    `expected certificate path: ${resolve(signingDir, "certificate.pfx")}\n`
  );
  for (const artifact of artifacts) {
    process.stdout.write(`  unsigned: ${artifact}\n`);
  }
  process.exit(0);
}

if (signtool === "") {
  process.stdout.write("signtool.exe not found, install the Windows SDK\n");
  process.exit(1);
}

let failed = false;
for (const artifact of artifacts) {
  process.stdout.write(`signing ${artifact}\n`);
  const args = [
    "sign",
    "/fd",
    "SHA256",
    "/tr",
    timestampUrl,
    "/td",
    "SHA256",
    "/f",
    certificate,
    ...(password === "" ? [] : ["/p", password]),
    artifact,
  ];
  const result = spawnSync(signtool, args, { stdio: "inherit", shell: false });
  if (result.status !== 0) {
    failed = true;
    continue;
  }

  const verify = spawnSync(signtool, ["verify", "/pa", artifact], {
    stdio: "inherit",
    shell: false,
  });
  process.stdout.write(`verified: ${artifact} (exit ${verify.status ?? 1})\n`);
  if (verify.status !== 0) {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
