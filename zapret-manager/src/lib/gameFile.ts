// Импортируем зависимости из модуля @tauri-apps/plugin-fs.
import { writeTextFile } from "@tauri-apps/plugin-fs";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { GameSettings } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const EXPORT_VERSION = 1.
const EXPORT_VERSION = 1;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameFile {
  // Обрабатываем конструкцию: version.
  version: number;
  // Обрабатываем конструкцию: game.
  game: Pick<GameSettings, "name" | "domains" | "ipRanges" | "ports">;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildGameFile(game: GameSettings): GameFile {
  // Возвращаем результат: { version: EXPORT_VERSION, game: { name: game.name, dom….
  return {
    // Обрабатываем конструкцию: version.
    version: EXPORT_VERSION,
    // Обрабатываем конструкцию: game.
    game: {
      // Обрабатываем конструкцию: name.
      name: game.name,
      // Обрабатываем конструкцию: domains.
      domains: game.domains.filter((item) => item.trim() !== ""),
      // Обрабатываем конструкцию: ipRanges.
      ipRanges: game.ipRanges.filter((item) => item.trim() !== ""),
      // Обрабатываем конструкцию: ports.
      ports: [...game.ports],
      // Закрываем текущий блок.
    },
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function parseGameFile(raw: string): GameFile["game"] | null {
  // Обрабатываем конструкцию: let parsed: unknown.
  let parsed: unknown;
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: parsed.
    parsed = JSON.parse(raw);
    // Закрываем текущий блок.
  } catch {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof parsed !== object || parsed === null.
  if (typeof parsed !== "object" || parsed === null) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const source = (parsed as { game?: unknown }).game.
  const source = (parsed as { game?: unknown }).game;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof source !== object || source === null.
  if (typeof source !== "object" || source === null) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const record = source as Record<string, unknown>.
  const record = source as Record<string, unknown>;
  // Обрабатываем конструкцию: const name = typeof record.name === string ? record.nam….
  const name = typeof record.name === "string" ? record.name : "";
  // Обрабатываем конструкцию: const domains = Array.isArray(record.domains) ? (record….
  const domains = Array.isArray(record.domains)
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      (record.domains as unknown[]).filter(
        // Объявляем функцию-обработчик или стрелочную функцию.
        (item): item is string => typeof item === "string"
        // Закрываем выражение или список аргументов.
      )
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      [];
  // Обрабатываем конструкцию: const ipRanges = Array.isArray(record.ipRanges) ? (reco….
  const ipRanges = Array.isArray(record.ipRanges)
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      (record.ipRanges as unknown[]).filter(
        // Объявляем функцию-обработчик или стрелочную функцию.
        (item): item is string => typeof item === "string"
        // Закрываем выражение или список аргументов.
      )
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      [];
  // Обрабатываем конструкцию: const ports = Array.isArray(record.ports) ? (record.por….
  const ports = Array.isArray(record.ports)
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      (record.ports as unknown[])
        // Продолжаем цепочку вызовов.
        .map((item) => Number(item))
        // Продолжаем цепочку вызовов.
        .filter((item) => Number.isInteger(item) && item > 0 && item <= 65535)
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      [];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: name === && domains.length === 0 && ipRanges.length ===….
  if (name === "" && domains.length === 0 && ipRanges.length === 0) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: { name, domains, ipRanges, ports }.
  return { name, domains, ipRanges, ports };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function writeGameFile(
  // Обрабатываем конструкцию: path.
  path: string,
  // Обрабатываем конструкцию: game.
  game: GameSettings
  // Закрываем выражение или список аргументов.
): Promise<void> {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Ожидаем завершение асинхронной операции await writeTextFile(path, JSON.stringify(buil….
    await writeTextFile(path, JSON.stringify(buildGameFile(game), null, 2));
    // Закрываем текущий блок.
  } catch (caught) {
    // Выбрасываем исключение throw new Error(toErrorMessage(caught), { cause: c….
    throw new Error(toErrorMessage(caught), { cause: caught });
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
