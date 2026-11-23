// Импортируем зависимости из модуля @/i18n.
import type { Translate } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/format.
import { currentLanguage } from "@/lib/format";
// Импортируем зависимости из модуля @/types.
import type { InitStage, IntegrityReport } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const STAGE_KEYS: Record<InitStage, TranslationKey> = {….
const STAGE_KEYS: Record<InitStage, TranslationKey> = {
  // Обрабатываем конструкцию: copying-zapret.
  "copying-zapret": "settings.resources.stageCopyingZapret",
  // Обрабатываем конструкцию: copying-strategies.
  "copying-strategies": "settings.resources.stageCopyingStrategies",
  // Обрабатываем конструкцию: copying-vpn.
  "copying-vpn": "settings.resources.stageCopyingVpn",
  // Обрабатываем конструкцию: finalizing.
  finalizing: "settings.resources.stageFinalizing",
  // Обрабатываем конструкцию: idle.
  idle: "settings.resources.stageDone",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Объявляем функцию resourceUnits.
function resourceUnits(language: string): readonly string[] {
  // Возвращаем результат: language === ru ? [Б, КиБ, МиБ, ГиБ] : [B, KiB, MiB, Gi….
  return language === "ru"
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      ["Б", "КиБ", "МиБ", "ГиБ"]
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      ["B", "KiB", "MiB", "GiB"];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatResourceVersion(version: string, t: Translate): string {
  // Обрабатываем конструкцию: const trimmed = version.trim().
  const trimmed = version.trim();
  // — разделитель логических блоков —

  // Возвращаем результат: trimmed === ? t(common.unknown) : trimmed.
  return trimmed === "" ? t("common.unknown") : trimmed;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function stageLabel(stage: InitStage, t: Translate): string {
  // Возвращаем результат: t(STAGE_KEYS[stage]).
  return t(STAGE_KEYS[stage]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatBytesForResources(bytes: number): string {
  // Обрабатываем конструкцию: const units = resourceUnits(currentLanguage()).
  const units = resourceUnits(currentLanguage());
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: bytes <= 0.
  if (bytes <= 0) {
    // Возвращаем результат: 0 ${units[0]}.
    return `0 ${units[0]}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: let value = bytes.
  let value = bytes;
  // Обрабатываем конструкцию: let index = 0.
  let index = 0;
  // — разделитель логических блоков —

  // Повторяем, пока верно условие value >= 1024 && index < units.length - 1.
  while (value >= 1024 && index < units.length - 1) {
    // Обрабатываем конструкцию: value.
    value /= 1024;
    // Обрабатываем конструкцию: index.
    index += 1;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const rounded = index === 0 ? String(Math.round(value))….
  const rounded = index === 0 ? String(Math.round(value)) : value.toFixed(1);
  // — разделитель логических блоков —

  // Возвращаем результат: ${rounded} ${units[index]}.
  return `${rounded} ${units[index]}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function clampPercent(percent: number): number {
  // Проверяем бизнес-условие: Number.isNaN(percent).
  if (Number.isNaN(percent)) {
    // Возвращаем результат: 0.
    return 0;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: Math.min(100, Math.max(0, Math.round(percent))).
  return Math.min(100, Math.max(0, Math.round(percent)));
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function describeIntegrityReport(
  // Обрабатываем конструкцию: report.
  report: IntegrityReport,
  // Обрабатываем конструкцию: t.
  t: Translate
  // Закрываем выражение или список аргументов.
): string {
  // Проверяем бизнес-условие: report.ok.
  if (report.ok) {
    // Возвращаем результат: t(settings.resources.integrityOk, { count: report.total….
    return t("settings.resources.integrityOk", { count: report.total });
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: report.missing.length > 0 && report.modified.length > 0.
  if (report.missing.length > 0 && report.modified.length > 0) {
    // Возвращаем результат: t(settings.resources.integrityMixed, { missing: report.….
    return t("settings.resources.integrityMixed", {
      // Обрабатываем конструкцию: missing.
      missing: report.missing.length,
      // Обрабатываем конструкцию: modified.
      modified: report.modified.length,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: report.missing.length > 0.
  if (report.missing.length > 0) {
    // Возвращаем результат: t(settings.resources.integrityMissing, { count: report.….
    return t("settings.resources.integrityMissing", {
      // Обрабатываем конструкцию: count.
      count: report.missing.length,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: t(settings.resources.integrityModified, { count: report….
  return t("settings.resources.integrityModified", {
    // Обрабатываем конструкцию: count.
    count: report.modified.length,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function shortKey(key: string): string {
  // Обрабатываем конструкцию: const parts = key.split(/).
  const parts = key.split("/");
  // Обрабатываем конструкцию: const name = parts[parts.length - 1].
  const name = parts[parts.length - 1];
  // — разделитель логических блоков —

  // Возвращаем результат: name === undefined || name === ? key : name.
  return name === undefined || name === "" ? key : name;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
