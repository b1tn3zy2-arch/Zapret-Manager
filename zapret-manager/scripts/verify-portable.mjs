import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";

const zipPath = process.argv[2];

if (zipPath === undefined || !existsSync(zipPath)) {
  console.error("usage: node scripts/verify-portable.mjs <portable.zip>");
  process.exit(1);
}

const workDir = mkdtempSync(join(tmpdir(), "zapret-portable-"));

try {
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `Expand-Archive -Path '${zipPath}' -DestinationPath '${workDir}' -Force`,
    ],
    { stdio: "inherit" }
  );

  const files = readdirSync(workDir);
  const exe = files.find((name) => name.toLowerCase().endsWith(".exe"));

  if (exe === undefined) {
    console.error(`в архиве нет исполняемого файла: ${files.join(", ")}`);
    process.exit(1);
  }

  for (const required of ["resources", "icons"]) {
    if (!existsSync(join(workDir, required))) {
      console.error(`в архиве нет каталога ${required}`);
      process.exit(1);
    }
  }

  const exePath = join(workDir, exe);

  console.log(`extracted: ${exePath}`);

  const child = execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `$p = Start-Process -FilePath '${exePath}' -PassThru; Start-Sleep -Seconds 18; if ($p.HasExited) { Write-Output 'EXITED'; exit 1 } else { Write-Output ('ALIVE ' + $p.Id); Stop-Process -Id $p.Id -Force }`,
    ],
    { encoding: "utf8" }
  );

  console.log(child.trim());

  const dataDir = join(
    process.env.APPDATA ?? "",
    "com.zapretmanager.app",
    "strategies"
  );
  const strategies = existsSync(dataDir)
    ? readdirSync(dataDir).filter((name) => name.endsWith(".bat"))
    : [];

  console.log(`распаковано стратегий: ${strategies.length}`);

  if (!child.includes("ALIVE")) {
    console.error("portable build did not stay running");
    process.exitCode = 1;
  } else if (strategies.length === 0) {
    console.error("portable build did not unpack bundled strategies");
    process.exitCode = 1;
  } else {
    console.log("portable check passed");
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
