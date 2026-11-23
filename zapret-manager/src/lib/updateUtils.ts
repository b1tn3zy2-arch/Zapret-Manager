// Импортируем зависимости из модуля @/lib/format.
import { currentLanguage } from "@/lib/format";
// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/constants.
import { UPDATE_UNKNOWN_VERSION } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function normalizeVersion(value: string): string {
  // Обрабатываем конструкцию: const trimmed = value.trim().replace(/^[vV]/, ).split(/….
  const trimmed = value.trim().replace(/^[vV]/, "").split(/[-+]/)[0] ?? "";
  // — разделитель логических блоков —

  // Возвращаем результат: trimmed.trim() === ? UPDATE_UNKNOWN_VERSION : trimmed.t….
  return trimmed.trim() === "" ? UPDATE_UNKNOWN_VERSION : trimmed.trim();
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatVersion(value: string): string {
  // Обрабатываем конструкцию: const normalized = normalizeVersion(value).
  const normalized = normalizeVersion(value);
  // — разделитель логических блоков —

  // Возвращаем результат: normalized === UPDATE_UNKNOWN_VERSION ? translateKey(up….
  return normalized === UPDATE_UNKNOWN_VERSION
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      translateKey("updateMeta.unknownVersion")
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      normalized;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isKnownVersion(value: string): boolean {
  // Возвращаем результат: normalizeVersion(value) !== UPDATE_UNKNOWN_VERSION.
  return normalizeVersion(value) !== UPDATE_UNKNOWN_VERSION;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isVersionIgnored(version: string, ignored: string[]): boolean {
  // Обрабатываем конструкцию: const target = normalizeVersion(version).
  const target = normalizeVersion(version);
  // — разделитель логических блоков —

  // Возвращаем результат: ignored.some((value) => normalizeVersion(value) === tar….
  return ignored.some((value) => normalizeVersion(value) === target);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatReleaseDate(iso: string): string {
  // Проверяем бизнес-условие: iso.trim() ===.
  if (iso.trim() === "") {
    // Возвращаем результат: translateKey(updateMeta.unknownDate).
    return translateKey("updateMeta.unknownDate");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const parsed = new Date(iso).
  const parsed = new Date(iso);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: Number.isNaN(parsed.getTime()).
  if (Number.isNaN(parsed.getTime())) {
    // Возвращаем результат: translateKey(updateMeta.unknownDate).
    return translateKey("updateMeta.unknownDate");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: parsed.toLocaleDateString( currentLanguage() === ru ? r….
  return parsed.toLocaleDateString(
    // Обрабатываем конструкцию: currentLanguage.
    currentLanguage() === "ru" ? "ru-RU" : "en-US",
    // Открываем объектный литерал.
    {
      // Обрабатываем конструкцию: day.
      day: "numeric",
      // Обрабатываем конструкцию: month.
      month: "long",
      // Обрабатываем конструкцию: year.
      year: "numeric",
      // Закрываем текущий блок.
    }
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatEta(seconds: number | null): string {
  // Проверяем бизнес-условие: seconds === null || !Number.isFinite(seconds).
  if (seconds === null || !Number.isFinite(seconds)) {
    // Возвращаем результат: translateKey(updateMeta.remainingUnknown).
    return translateKey("updateMeta.remainingUnknown");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: seconds < 60.
  if (seconds < 60) {
    // Возвращаем результат: translateKey(updateMeta.remainingSeconds, { seconds: Ma….
    return translateKey("updateMeta.remainingSeconds", {
      // Обрабатываем конструкцию: seconds.
      seconds: Math.ceil(seconds),
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const minutes = Math.ceil(seconds / 60).
  const minutes = Math.ceil(seconds / 60);
  // — разделитель логических блоков —

  // Возвращаем результат: translateKey(updateMeta.remainingMinutes, { minutes }).
  return translateKey("updateMeta.remainingMinutes", { minutes });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const REPO_PATTERN = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+….
const REPO_PATTERN = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isValidRepo(value: string): boolean {
  // Возвращаем результат: REPO_PATTERN.test(value.trim()).
  return REPO_PATTERN.test(value.trim());
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function versionWithoutPrefix(value: string): string {
  // Возвращаем результат: value.trim().replace(/^[vV]/, ).
  return value.trim().replace(/^[vV]/, "");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
