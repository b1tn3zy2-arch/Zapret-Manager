import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

import { formatLogLine } from "@/lib/format";
import type { LogEntry } from "@/types";

const TEXT_FILTERS = [
  { name: "Текстовый файл", extensions: ["txt"] },
  { name: "Лог-файл", extensions: ["log"] },
];

export type ExportOutcome =
  { status: "cancelled" } | { status: "written"; path: string; bytes: number };

export function buildExportFileName(now: Date): string {
  const pad = (value: number): string => value.toString().padStart(2, "0");

  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}`;

  return `zapret-logs-${date}-${time}.txt`;
}

export function buildExportContent(logs: LogEntry[]): string {
  return logs.map(formatLogLine).join("\n");
}

export async function exportLogsToFile(
  logs: LogEntry[]
): Promise<ExportOutcome> {
  if (logs.length === 0) {
    return { status: "cancelled" };
  }

  const target = await save({
    title: "Экспорт логов",
    defaultPath: buildExportFileName(new Date()),
    filters: TEXT_FILTERS,
  });

  if (target === null || target === "") {
    return { status: "cancelled" };
  }

  const bytes = await invoke<number>("write_log_export", {
    path: target,
    content: buildExportContent(logs),
  });

  return { status: "written", path: target, bytes };
}
