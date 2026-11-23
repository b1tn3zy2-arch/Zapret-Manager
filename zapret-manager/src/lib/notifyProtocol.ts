// Импортируем зависимости из модуля @/types.
import type { NotificationKind } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const NOTIFY_PREFIX = "notify:";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ParsedNotify {
  // Обрабатываем конструкцию: kind.
  kind: NotificationKind;
  // Обрабатываем конструкцию: title.
  title: string;
  // Обрабатываем конструкцию: body.
  body: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const KINDS: NotificationKind[] = [success, error, warn….
const KINDS: NotificationKind[] = ["success", "error", "warning", "info"];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function parseNotify(raw: unknown): ParsedNotify | null {
  // Сохраняем пояснение разработчика: // payload может оказаться чем угодно: раньше нестроковое зн…
  // payload может оказаться чем угодно: раньше нестроковое значение роняло
  // Сохраняем пояснение разработчика: // слушателя события, а вместе с ним весь запуск стратегии
  // слушателя события, а вместе с ним весь запуск стратегии
  // Проверяем бизнес-условие: typeof raw !== string || !raw.startsWith(NOTIFY_PREFIX).
  if (typeof raw !== "string" || !raw.startsWith(NOTIFY_PREFIX)) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const rest = raw.slice(NOTIFY_PREFIX.length).
  const rest = raw.slice(NOTIFY_PREFIX.length);
  // Обрабатываем конструкцию: const colon = rest.indexOf(:).
  const colon = rest.indexOf(":");
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: colon === -1.
  if (colon === -1) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const kind = rest.slice(0, colon).
  const kind = rest.slice(0, colon);
  // Обрабатываем конструкцию: const parts = rest.slice(colon + 1).split(|).
  const parts = rest.slice(colon + 1).split("|");
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: parts.length < 2.
  if (parts.length < 2) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [title, body] = parts.
  const [title, body] = parts;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: title === undefined || body === undefined.
  if (title === undefined || body === undefined) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !KINDS.includes(kind as NotificationKind).
  if (!KINDS.includes(kind as NotificationKind)) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: { kind: kind as NotificationKind, title, body }.
  return { kind: kind as NotificationKind, title, body };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
