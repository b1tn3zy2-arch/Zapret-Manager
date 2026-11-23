// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/format.
import { formatLogLine } from "@/lib/format";
// Импортируем зависимости из модуля @/types.
import type { LogEntry } from "@/types";
// — разделитель логических блоков —

// Объявляем интерфейс SavedExport с контрактом данных.
interface SavedExport {
  // Обрабатываем конструкцию: path.
  path: string;
  // Обрабатываем конструкцию: bytes.
  bytes: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type ExportOutcome =
  // Обрабатываем конструкцию: { status: cancelled }.
  { status: "cancelled" } | { status: "written"; path: string; bytes: number };
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildExportFileName(now: Date): string {
  // Обрабатываем конструкцию: const pad = (value: number): string => value.toString()….
  const pad = (value: number): string => value.toString().padStart(2, "0");
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const date = ${now.getFullYear()}-${pad(now.getMonth() ….
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  // Обрабатываем конструкцию: const time = ${pad(now.getHours())}-${pad(now.getMinute….
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}`;
  // — разделитель логических блоков —

  // Возвращаем результат: zapret-logs-${date}-${time}.txt.
  return `zapret-logs-${date}-${time}.txt`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildExportContent(logs: LogEntry[]): string {
  // Возвращаем результат: logs.map(formatLogLine).join(\n).
  return logs.map(formatLogLine).join("\n");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function exportLogsToFile(
  // Обрабатываем конструкцию: logs.
  logs: LogEntry[]
  // Закрываем выражение или список аргументов.
): Promise<ExportOutcome> {
  // Проверяем бизнес-условие: logs.length === 0.
  if (logs.length === 0) {
    // Возвращаем результат: { status: cancelled }.
    return { status: "cancelled" };
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const saved = await secureInvoke<SavedExport | null>(ex….
  const saved = await secureInvoke<SavedExport | null>("export_logs_file", {
    // Обрабатываем конструкцию: title.
    title: translateKey("exportLogs.title"),
    // Обрабатываем конструкцию: defaultName.
    defaultName: buildExportFileName(new Date()),
    // Обрабатываем конструкцию: content.
    content: buildExportContent(logs),
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: saved === null.
  if (saved === null) {
    // Возвращаем результат: { status: cancelled }.
    return { status: "cancelled" };
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: { status: written, path: saved.path, bytes: saved.bytes….
  return { status: "written", path: saved.path, bytes: saved.bytes };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
