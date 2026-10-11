import { translateKey } from "@/i18n/core";
import { APP_NAME } from "@/lib/constants";
import { formatLogTime } from "@/lib/utils";
import { formatVersion } from "@/lib/updateUtils";
import type { LogEntry, Strategy, SystemInfo } from "@/types";

const LOGS_IN_REPORT = 5;

function runningStrategies(strategies: Strategy[]): string {
  const names = strategies
    .filter((strategy) => strategy.status === "running")
    .map((strategy) => strategy.name);

  if (names.length === 0) {
    return translateKey("system.none");
  }

  return names.join(", ");
}

function logLines(logs: LogEntry[]): string {
  if (logs.length === 0) {
    return translateKey("system.none");
  }

  return logs
    .slice(0, LOGS_IN_REPORT)
    .map(
      (entry) =>
        `${formatLogTime(entry.timestamp)} [${entry.level}] ${entry.source}: ${entry.message}`
    )
    .join("\n");
}

export function formatOsLabel(info: SystemInfo): string {
  const name = info.os.trim();
  const head = info.osVersion.toLowerCase().startsWith(name.toLowerCase())
    ? ""
    : `${name} `;

  return `${head}${info.osVersion} ${info.osBuild}`.trim();
}

export function formatSystemInfo(
  info: SystemInfo,
  logs: LogEntry[],
  strategies: Strategy[]
): string {
  return [
    `${APP_NAME} ${formatVersion(info.appVersion)}`,
    `OS: ${formatOsLabel(info)} (${info.arch})`,
    `WebView2: ${info.webviewVersion}`,
    `Tauri: ${info.tauriVersion}`,
    `Rust: ${info.rustVersion}`,
    `Strategies: ${strategies.length}`,
    `Running: ${runningStrategies(strategies)}`,
    `Logs: ${logs.length}`,
    translateKey("system.recentLogs"),
    logLines(logs),
  ].join("\n");
}
