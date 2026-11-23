// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/constants.
import { APP_NAME } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/format.
import { formatLogTime } from "@/lib/format";
// Импортируем зависимости из модуля @/lib/updateUtils.
import { formatVersion } from "@/lib/updateUtils";
// Импортируем зависимости из модуля @/types.
import type { LogEntry, Strategy, SystemInfo } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LOGS_IN_REPORT = 5.
const LOGS_IN_REPORT = 5;
// — разделитель логических блоков —

// Объявляем функцию runningStrategies.
function runningStrategies(strategies: Strategy[]): string {
  // Обрабатываем конструкцию: const names = strategies .filter((strategy) => strategy….
  const names = strategies
    // Продолжаем цепочку вызовов.
    .filter((strategy) => strategy.status === "running")
    // Продолжаем цепочку вызовов.
    .map((strategy) => strategy.name);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: names.length === 0.
  if (names.length === 0) {
    // Возвращаем результат: translateKey(system.none).
    return translateKey("system.none");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: names.join(, ).
  return names.join(", ");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию logLines.
function logLines(logs: LogEntry[]): string {
  // Проверяем бизнес-условие: logs.length === 0.
  if (logs.length === 0) {
    // Возвращаем результат: translateKey(system.none).
    return translateKey("system.none");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: logs .slice(0, LOGS_IN_REPORT) .map( (entry) => ${forma….
  return (
    // Продолжаем предыдущую конструкцию.
    logs
      // Продолжаем цепочку вызовов.
      .slice(0, LOGS_IN_REPORT)
      // Продолжаем цепочку вызовов.
      .map(
        // Объявляем функцию-обработчик или стрелочную функцию.
        (entry) =>
          // Обрабатываем конструкцию: ${.
          `${formatLogTime(entry.timestamp)} [${entry.level}] ${entry.source}: ${entry.message}`
        // Закрываем выражение или список аргументов.
      )
      // Продолжаем цепочку вызовов.
      .join("\n")
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatOsLabel(info: SystemInfo): string {
  // Обрабатываем конструкцию: const name = info.os.trim().
  const name = info.os.trim();
  // Обрабатываем конструкцию: const head = info.osVersion.toLowerCase().startsWith(na….
  const head = info.osVersion.toLowerCase().startsWith(name.toLowerCase())
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      ""
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      `${name} `;
  // — разделитель логических блоков —

  // Возвращаем результат: ${head}${info.osVersion} ${info.osBuild}.trim().
  return `${head}${info.osVersion} ${info.osBuild}`.trim();
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatSystemInfo(
  // Обрабатываем конструкцию: info.
  info: SystemInfo,
  // Обрабатываем конструкцию: logs.
  logs: LogEntry[],
  // Обрабатываем конструкцию: strategies.
  strategies: Strategy[]
  // Закрываем выражение или список аргументов.
): string {
  // Возвращаем результат: [ ${APP_NAME} ${formatVersion(info.appVersion)}, OS: ${….
  return [
    // Обрабатываем конструкцию: ${.
    `${APP_NAME} ${formatVersion(info.appVersion)}`,
    // Обрабатываем конструкцию: OS: ${.
    `OS: ${formatOsLabel(info)} (${info.arch})`,
    // Обрабатываем конструкцию: WebView2: ${.
    `WebView2: ${info.webviewVersion}`,
    // Обрабатываем конструкцию: Tauri: ${.
    `Tauri: ${info.tauriVersion}`,
    // Обрабатываем конструкцию: Rust: ${.
    `Rust: ${info.rustVersion}`,
    // Обрабатываем конструкцию: Strategies: ${.
    `Strategies: ${strategies.length}`,
    // Обрабатываем конструкцию: Running: ${.
    `Running: ${runningStrategies(strategies)}`,
    // Обрабатываем конструкцию: Logs: ${.
    `Logs: ${logs.length}`,
    // Обрабатываем конструкцию: translateKey.
    translateKey("system.recentLogs"),
    // Обрабатываем конструкцию: logLines.
    logLines(logs),
    // Закрываем массив или список.
  ].join("\n");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
