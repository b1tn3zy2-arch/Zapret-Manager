// Импортируем зависимости из модуля nanoid.
import { nanoid } from "nanoid";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/types.
import type { LogEntry, LogLevel, LogSource } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MESSAGES = { info: [ Сканирование папки со страте….
const MESSAGES = {
  // Обрабатываем конструкцию: info.
  info: [
    // Обрабатываем конструкцию: Сканирование папки со стратегиями завершено.
    "Сканирование папки со стратегиями завершено",
    // Обрабатываем конструкцию: Загружены стратегии из resources/zapret.
    "Загружены стратегии из resources/zapret",
    // Обрабатываем конструкцию: Проверка соединения завершена.
    "Проверка соединения завершена",
    // Обрабатываем конструкцию: Настроения синхронизированы с диском.
    "Настроения синхронизированы с диском",
    // Обрабатываем конструкцию: Winws запущен в режиме auto.
    "Winws запущен в режиме auto",
    // Закрываем массив или список.
  ],
  // Обрабатываем конструкцию: success.
  success: [
    // Обрабатываем конструкцию: Стратегия Discord + YouTube запущена.
    "Стратегия Discord + YouTube запущена",
    // Обрабатываем конструкцию: Процесс winws.exe обнаружен.
    "Процесс winws.exe обнаружен",
    // Обрабатываем конструкцию: Настройки сохранены в config.json.
    "Настройки сохранены в config.json",
    // Обрабатываем конструкцию: VPN-туннель поднят.
    "VPN-туннель поднят",
    // Закрываем массив или список.
  ],
  // Обрабатываем конструкцию: warn.
  warn: [
    // Обрабатываем конструкцию: ipset-all.txt отсутствует, используется заглушка.
    "ipset-all.txt отсутствует, используется заглушка",
    // Обрабатываем конструкцию: Проверка обновлений пропущена: NO_UPDATE_CHECK=1.
    "Проверка обновлений пропущена: NO_UPDATE_CHECK=1",
    // Обрабатываем конструкцию: Ответ сервера задержался на 1200 мс.
    "Ответ сервера задержался на 1200 мс",
    // Обрабатываем конструкцию: Не удалось прочитать кэш стратегий.
    "Не удалось прочитать кэш стратегий",
    // Закрываем массив или список.
  ],
  // Обрабатываем конструкцию: error.
  error: [
    // Обрабатываем конструкцию: Не удалось запустить winws.exe: доступ запрещён.
    "Не удалось запустить winws.exe: доступ запрещён",
    // Обрабатываем конструкцию: Сервис не отвечает после запуска.
    "Сервис не отвечает после запуска",
    // Обрабатываем конструкцию: Файл стратегии повреждён.
    "Файл стратегии повреждён",
    // Обрабатываем конструкцию: Соединение разорвано.
    "Соединение разорвано",
    // Закрываем массив или список.
  ],
  // Обрабатываем конструкцию: debug.
  debug: ["filter=%s прочитан", "Проверка путей через bat_env::resolve_path"],
  // Закрываем текущий блок.
} as const satisfies Record<LogLevel, readonly string[]>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SOURCES = [ system, strategy, user, vpn, ] as con….
const SOURCES = [
  // Обрабатываем конструкцию: system.
  "system",
  // Обрабатываем конструкцию: strategy.
  "strategy",
  // Обрабатываем конструкцию: user.
  "user",
  // Обрабатываем конструкцию: vpn.
  "vpn",
  // Закрываем массив или список.
] as const satisfies readonly LogSource[];
// — разделитель логических блоков —

// Обрабатываем конструкцию: const WEIGHTS = { info: 0.8, success: 0.1, warn: 0.05, ….
const WEIGHTS = {
  // Обрабатываем конструкцию: info.
  info: 0.8,
  // Обрабатываем конструкцию: success.
  success: 0.1,
  // Обрабатываем конструкцию: warn.
  warn: 0.05,
  // Обрабатываем конструкцию: error.
  error: 0.05,
  // Закрываем текущий блок.
} as const satisfies Record<Exclude<LogLevel, "debug">, number>;
// — разделитель логических блоков —

// Объявляем функцию pickLevel.
function pickLevel(): LogLevel {
  // Обрабатываем конструкцию: const roll = Math.random().
  const roll = Math.random();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: roll < WEIGHTS.error.
  if (roll < WEIGHTS.error) {
    // Возвращаем результат: error.
    return "error";
    // Закрываем текущий блок.
  }
  // Проверяем бизнес-условие: roll < WEIGHTS.error + WEIGHTS.warn.
  if (roll < WEIGHTS.error + WEIGHTS.warn) {
    // Возвращаем результат: warn.
    return "warn";
    // Закрываем текущий блок.
  }
  // Проверяем бизнес-условие: roll < WEIGHTS.error + WEIGHTS.warn + WEIGHTS.success.
  if (roll < WEIGHTS.error + WEIGHTS.warn + WEIGHTS.success) {
    // Возвращаем результат: success.
    return "success";
    // Закрываем текущий блок.
  }
  // Возвращаем результат: info.
  return "info";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию pickMessage.
function pickMessage(level: LogLevel): string {
  // Обрабатываем конструкцию: const pool = MESSAGES[level].
  const pool = MESSAGES[level];
  // Обрабатываем конструкцию: const index = Math.floor(Math.random() * pool.length).
  const index = Math.floor(Math.random() * pool.length);
  // Возвращаем результат: pool[index] ?? pool[0].
  return pool[index] ?? pool[0];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function generateMockLogs(count: number): LogEntry[] {
  // Обрабатываем конструкцию: const entries: LogEntry[] = [].
  const entries: LogEntry[] = [];
  // Обрабатываем конструкцию: const now = Date.now().
  const now = Date.now();
  // Обрабатываем конструкцию: const strategyId = mock-discord-youtube.
  const strategyId = "mock-discord-youtube";
  // — разделитель логических блоков —

  // Запускаем цикл с инициализацией, условием и шагом.
  for (let index = 0; index < count; index += 1) {
    // Обрабатываем конструкцию: const level = Math.random() < 0.02 ? debug : pickLevel(….
    const level = Math.random() < 0.02 ? "debug" : pickLevel();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: entries.
    entries.push({
      // Обрабатываем конструкцию: id.
      id: nanoid(),
      // Обрабатываем конструкцию: timestamp.
      timestamp: now - index * 137,
      // Передаём поле level в объект.
      level,
      // Обрабатываем конструкцию: source.
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)] ?? "system",
      // Обрабатываем конструкцию: message.
      message: pickMessage(level),
      // Обрабатываем конструкцию: strategyId.
      strategyId: level === "debug" ? undefined : strategyId,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: entries.
  return entries;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
