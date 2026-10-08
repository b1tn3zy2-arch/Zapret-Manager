import { nanoid } from "nanoid";

import type { LogEntry, LogLevel, LogSource } from "@/types";

const MESSAGES = {
  info: [
    "Сканирование папки со стратегиями завершено",
    "Загружены стратегии из resources/zapret",
    "Проверка соединения завершена",
    "Настроения синхронизированы с диском",
    "Winws запущен в режиме auto",
  ],
  success: [
    "Стратегия Discord + YouTube запущена",
    "Процесс winws.exe обнаружен",
    "Настройки сохранены в config.json",
    "VPN-туннель поднят",
  ],
  warn: [
    "ipset-all.txt отсутствует, используется заглушка",
    "Проверка обновлений пропущена: NO_UPDATE_CHECK=1",
    "Ответ сервера задержался на 1200 мс",
    "Не удалось прочитать кэш стратегий",
  ],
  error: [
    "Не удалось запустить winws.exe: доступ запрещён",
    "Сервис не отвечает после запуска",
    "Файл стратегии повреждён",
    "Соединение разорвано",
  ],
  debug: ["filter=%s прочитан", "Проверка путей через bat_env::resolve_path"],
} as const satisfies Record<LogLevel, readonly string[]>;

const SOURCES = [
  "system",
  "strategy",
  "user",
  "vpn",
] as const satisfies readonly LogSource[];

const WEIGHTS = {
  info: 0.8,
  success: 0.1,
  warn: 0.05,
  error: 0.05,
} as const satisfies Record<Exclude<LogLevel, "debug">, number>;

function pickLevel(): LogLevel {
  const roll = Math.random();

  if (roll < WEIGHTS.error) {
    return "error";
  }
  if (roll < WEIGHTS.error + WEIGHTS.warn) {
    return "warn";
  }
  if (roll < WEIGHTS.error + WEIGHTS.warn + WEIGHTS.success) {
    return "success";
  }
  return "info";
}

function pickMessage(level: LogLevel): string {
  const pool = MESSAGES[level];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? pool[0];
}

export function generateMockLogs(count: number): LogEntry[] {
  const entries: LogEntry[] = [];
  const now = Date.now();
  const strategyId = "mock-discord-youtube";

  for (let index = 0; index < count; index += 1) {
    const level = Math.random() < 0.02 ? "debug" : pickLevel();

    entries.push({
      id: nanoid(),
      timestamp: now - index * 137,
      level,
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)] ?? "system",
      message: pickMessage(level),
      strategyId: level === "debug" ? undefined : strategyId,
    });
  }

  return entries;
}
