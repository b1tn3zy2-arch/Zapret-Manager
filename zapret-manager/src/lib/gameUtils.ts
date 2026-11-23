// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/format.
import { currentLanguage } from "@/lib/format";
// Импортируем зависимости из модуля @/types.
import type { GameSettings } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MAX_ID_ATTEMPTS = 50.
const MAX_ID_ATTEMPTS = 50;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function slugifyGameName(name: string): string {
  // Обрабатываем конструкцию: const slug = name .trim() .toLowerCase() .replace(/[^a-….
  const slug = name
    // Продолжаем цепочку вызовов.
    .trim()
    // Продолжаем цепочку вызовов.
    .toLowerCase()
    // Продолжаем цепочку вызовов.
    .replace(/[^a-z0-9]+/g, "-")
    // Продолжаем цепочку вызовов.
    .replace(/^-+|-+$/g, "");
  // — разделитель логических блоков —

  // Возвращаем результат: slug === ? game : slug.slice(0, 48).
  return slug === "" ? "game" : slug.slice(0, 48);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Оттенок запасной обложки по названию игры.
 * Оттенок запасной обложки по названию игры.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Нужен для игр, у которых нет ни обложки в базе, ни картинк…
 * Нужен для игр, у которых нет ни обложки в базе, ни картинки в папке, ни иконки
 // Сохраняем пояснение разработчика: * exe: вместо пустой заглушки карточка получает узнаваемый ц…
 * exe: вместо пустой заглушки карточка получает узнаваемый цвет, причём одна и
 // Сохраняем пояснение разработчика: * та же игра всегда выглядит одинаково.
 * та же игра всегда выглядит одинаково.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function coverHueFromName(name: string): number {
  // Обрабатываем конструкцию: let hash = 0.
  let hash = 0;
  // — разделитель логических блоков —

  // Запускаем цикл с инициализацией, условием и шагом.
  for (let index = 0; index < name.length; index += 1) {
    // Обрабатываем конструкцию: hash.
    hash = (hash * 31 + name.charCodeAt(index)) % 360;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // разводим по кругу с шагом 137°, чтобы соседние названия н…
  // разводим по кругу с шагом 137°, чтобы соседние названия не сливались в один цвет
  // Возвращаем результат: (hash * 137) % 360.
  return (hash * 137) % 360;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function generateGameId(
  // Обрабатываем конструкцию: name.
  name: string,
  // Обрабатываем конструкцию: existingIds.
  existingIds: readonly string[]
  // Закрываем выражение или список аргументов.
): string {
  // Обрабатываем конструкцию: const base = slugifyGameName(name).
  const base = slugifyGameName(name);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !existingIds.includes(base).
  if (!existingIds.includes(base)) {
    // Возвращаем результат: base.
    return base;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Запускаем цикл с инициализацией, условием и шагом.
  for (let suffix = 2; suffix < MAX_ID_ATTEMPTS; suffix += 1) {
    // Обрабатываем конструкцию: const candidate = ${base}-${suffix}.
    const candidate = `${base}-${suffix}`;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: !existingIds.includes(candidate).
    if (!existingIds.includes(candidate)) {
      // Возвращаем результат: candidate.
      return candidate;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ${base}-${Date.now()}.
  return `${base}-${Date.now()}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function countFilled(entries: readonly string[]): number {
  // Возвращаем результат: entries.filter((entry) => entry.trim() !== ).length.
  return entries.filter((entry) => entry.trim() !== "").length;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatGameStats(game: GameSettings): string {
  // Обрабатываем конструкцию: const domains = countFilled(game.domains).
  const domains = countFilled(game.domains);
  // Обрабатываем конструкцию: const ips = countFilled(game.ipRanges).
  const ips = countFilled(game.ipRanges);
  // Обрабатываем конструкцию: const ports = game.ports.filter((port) => Number.isFini….
  const ports = game.ports.filter((port) => Number.isFinite(port)).length;
  // — разделитель логических блоков —

  // Возвращаем результат: [ ${domains} ${pluralize(domains, domainForms())}, ${ip….
  return [
    // Обрабатываем конструкцию: ${.
    `${domains} ${pluralize(domains, domainForms())}`,
    // Обрабатываем конструкцию: ${.
    `${ips} ${pluralize(ips, ipForms())}`,
    // Обрабатываем конструкцию: ${.
    `${ports} ${pluralize(ports, portForms())}`,
    // Закрываем массив или список.
  ].join(" · ");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function gameHasEntries(game: GameSettings): boolean {
  // Возвращаем результат: countFilled(game.domains) > 0 || countFilled(game.ipRan….
  return countFilled(game.domains) > 0 || countFilled(game.ipRanges) > 0;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function enabledGames(games: readonly GameSettings[]): GameSettings[] {
  // Возвращаем результат: games.filter((game) => game.enabled && gameHasEntries(g….
  return games.filter((game) => game.enabled && gameHasEntries(game));
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию pluralize.
function pluralize(
  // Обрабатываем конструкцию: count.
  count: number,
  // Обрабатываем конструкцию: forms.
  forms: readonly [string, string, string]
  // Закрываем выражение или список аргументов.
): string {
  // Обрабатываем конструкцию: const mod100 = count % 100.
  const mod100 = count % 100;
  // Обрабатываем конструкцию: const mod10 = count % 10.
  const mod10 = count % 10;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mod100 >= 11 && mod100 <= 14.
  if (mod100 >= 11 && mod100 <= 14) {
    // Возвращаем результат: forms[2].
    return forms[2];
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mod10 === 1.
  if (mod10 === 1) {
    // Возвращаем результат: forms[0].
    return forms[0];
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mod10 >= 2 && mod10 <= 4.
  if (mod10 >= 2 && mod10 <= 4) {
    // Возвращаем результат: forms[1].
    return forms[1];
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: forms[2].
  return forms[2];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию domainForms.
function domainForms(): readonly [string, string, string] {
  // Обрабатываем конструкцию: const one = translateKey(units.domainOne).
  const one = translateKey("units.domainOne");
  // Обрабатываем конструкцию: const few = translateKey(units.domainFew).
  const few = translateKey("units.domainFew");
  // — разделитель логических блоков —

  // Возвращаем результат: currentLanguage() === ru ? [one, translateKey(units.dom….
  return currentLanguage() === "ru"
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      [one, translateKey("units.domainTwo"), few]
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      [one, few, few];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию portForms.
function portForms(): readonly [string, string, string] {
  // Обрабатываем конструкцию: const one = translateKey(units.portOne).
  const one = translateKey("units.portOne");
  // Обрабатываем конструкцию: const few = translateKey(units.portFew).
  const few = translateKey("units.portFew");
  // — разделитель логических блоков —

  // Возвращаем результат: currentLanguage() === ru ? [one, translateKey(units.por….
  return currentLanguage() === "ru"
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      [one, translateKey("units.portTwo"), few]
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      [one, few, few];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию ipForms.
function ipForms(): readonly [string, string, string] {
  // Возвращаем результат: [IP, IP, IP].
  return ["IP", "IP", "IP"];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
