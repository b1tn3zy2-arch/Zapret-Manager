import type { Translate } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { currentLanguage } from "@/lib/format";
import type { InitStage, IntegrityReport } from "@/types";

const STAGE_KEYS: Record<InitStage, TranslationKey> = {
  "copying-zapret": "settings.resources.stageCopyingZapret",
  "copying-strategies": "settings.resources.stageCopyingStrategies",
  finalizing: "settings.resources.stageFinalizing",
  idle: "settings.resources.stageDone",
};

function resourceUnits(language: string): readonly string[] {
  return language === "ru"
    ? ["Б", "КиБ", "МиБ", "ГиБ"]
    : ["B", "KiB", "MiB", "GiB"];
}

export function formatResourceVersion(version: string, t: Translate): string {
  const trimmed = version.trim();

  return trimmed === "" ? t("common.unknown") : trimmed;
}

export function stageLabel(stage: InitStage, t: Translate): string {
  return t(STAGE_KEYS[stage]);
}

export function formatBytesForResources(bytes: number): string {
  const units = resourceUnits(currentLanguage());

  if (bytes <= 0) {
    return `0 ${units[0]}`;
  }

  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  const rounded = index === 0 ? String(Math.round(value)) : value.toFixed(1);

  return `${rounded} ${units[index]}`;
}

export function clampPercent(percent: number): number {
  if (Number.isNaN(percent)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(percent)));
}

export function describeIntegrityReport(
  report: IntegrityReport,
  t: Translate
): string {
  if (report.ok) {
    return t("settings.resources.integrityOk", { count: report.total });
  }

  if (report.missing.length > 0 && report.modified.length > 0) {
    return t("settings.resources.integrityMixed", {
      missing: report.missing.length,
      modified: report.modified.length,
    });
  }

  if (report.missing.length > 0) {
    return t("settings.resources.integrityMissing", {
      count: report.missing.length,
    });
  }

  return t("settings.resources.integrityModified", {
    count: report.modified.length,
  });
}

export function shortKey(key: string): string {
  const parts = key.split("/");
  const name = parts[parts.length - 1];

  return name === undefined || name === "" ? key : name;
}
