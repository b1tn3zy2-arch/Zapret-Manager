import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");

const steps = [
  { label: "типы (tsc)", command: "pnpm", args: ["typecheck"] },
  { label: "линтер (eslint)", command: "pnpm", args: ["lint"] },
  {
    label: "форматирование (prettier)",
    command: "pnpm",
    args: ["format:check"],
  },
  { label: "мёртвый код (knip)", command: "pnpm", args: ["lint:dead"] },
  { label: "unit-тесты", command: "pnpm", args: ["test"] },
  {
    label: "Rust-тесты",
    command: "cargo",
    args: ["test", "--manifest-path", "src-tauri/Cargo.toml"],
  },
  {
    label: "clippy",
    command: "cargo",
    args: [
      "clippy",
      "--manifest-path",
      "src-tauri/Cargo.toml",
      "--all-targets",
      "--",
      "-D",
      "warnings",
    ],
  },
];

if (process.argv.includes("--skip-tests")) {
  console.log("Тесты пропущены (--skip-tests)");
} else {
  for (const step of steps) {
    console.log(`\n=== ${step.label}`);
    execFileSync(step.command, step.args, { cwd: root, stdio: "inherit" });
  }
}

console.log("\n=== сборка Tauri");
execFileSync("pnpm", ["tauri", "build"], { cwd: root, stdio: "inherit" });

console.log("\n=== артефакты и контрольные суммы");
execFileSync("node", [join(scriptDir, "release-artifacts.mjs")], {
  cwd: root,
  stdio: "inherit",
});

const changelog = readFileSync(join(root, "..", "CHANGELOG.md"), "utf8");
const { version } = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8")
);

if (!changelog.includes(`## [${version}]`)) {
  console.error(
    `В CHANGELOG.md нет секции для версии ${version}. Заполните перед публикацией.`
  );
  process.exitCode = 1;
}

if (!existsSync(join(root, "release", "SHA256SUMS.txt"))) {
  console.error("SHA256SUMS.txt не создан");
  process.exitCode = 1;
}

console.log(
  "\nРелиз собран локально. Публикация — через тег v" +
    version +
    " в GitHub Actions."
);
