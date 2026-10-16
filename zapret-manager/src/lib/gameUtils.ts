import { translateKey } from "@/i18n/core";
import { currentLanguage } from "@/lib/format";
import type { GameSettings } from "@/types";

const MAX_ID_ATTEMPTS = 50;

export function slugifyGameName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug === "" ? "game" : slug.slice(0, 48);
}

/**
 * Оттенок запасной обложки по названию игры.
 *
 * Нужен для игр, у которых нет ни обложки в базе, ни картинки в папке, ни иконки
 * exe: вместо пустой заглушки карточка получает узнаваемый цвет, причём одна и
 * та же игра всегда выглядит одинаково.
 */
export function coverHueFromName(name: string): number {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 360;
  }

  // разводим по кругу с шагом 137°, чтобы соседние названия не сливались в один цвет
  return (hash * 137) % 360;
}

export function generateGameId(
  name: string,
  existingIds: readonly string[]
): string {
  const base = slugifyGameName(name);

  if (!existingIds.includes(base)) {
    return base;
  }

  for (let suffix = 2; suffix < MAX_ID_ATTEMPTS; suffix += 1) {
    const candidate = `${base}-${suffix}`;

    if (!existingIds.includes(candidate)) {
      return candidate;
    }
  }

  return `${base}-${Date.now()}`;
}

export function countFilled(entries: readonly string[]): number {
  return entries.filter((entry) => entry.trim() !== "").length;
}

export function formatGameStats(game: GameSettings): string {
  const domains = countFilled(game.domains);
  const ips = countFilled(game.ipRanges);
  const ports = game.ports.filter((port) => Number.isFinite(port)).length;

  return [
    `${domains} ${pluralize(domains, domainForms())}`,
    `${ips} ${pluralize(ips, ipForms())}`,
    `${ports} ${pluralize(ports, portForms())}`,
  ].join(" · ");
}

export function gameHasEntries(game: GameSettings): boolean {
  return countFilled(game.domains) > 0 || countFilled(game.ipRanges) > 0;
}

export function enabledGames(games: readonly GameSettings[]): GameSettings[] {
  return games.filter((game) => game.enabled && gameHasEntries(game));
}

function pluralize(
  count: number,
  forms: readonly [string, string, string]
): string {
  const mod100 = count % 100;
  const mod10 = count % 10;

  if (mod100 >= 11 && mod100 <= 14) {
    return forms[2];
  }

  if (mod10 === 1) {
    return forms[0];
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1];
  }

  return forms[2];
}

function domainForms(): readonly [string, string, string] {
  const one = translateKey("units.domainOne");
  const few = translateKey("units.domainFew");

  return currentLanguage() === "ru"
    ? [one, translateKey("units.domainTwo"), few]
    : [one, few, few];
}

function portForms(): readonly [string, string, string] {
  const one = translateKey("units.portOne");
  const few = translateKey("units.portFew");

  return currentLanguage() === "ru"
    ? [one, translateKey("units.portTwo"), few]
    : [one, few, few];
}

function ipForms(): readonly [string, string, string] {
  return ["IP", "IP", "IP"];
}
