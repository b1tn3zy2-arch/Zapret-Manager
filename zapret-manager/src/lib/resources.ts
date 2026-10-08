import type { Translate } from "@/i18n";
import type { InitStage, IntegrityReport } from "@/types";

const STAGE_LABELS: Record<InitStage, string> = {
  "copying-zapret": "Копирование движка zapret",
  "copying-strategies": "Копирование стратегий",
  finalizing: "Финализация",
  idle: "Готово",
};

export function formatResourceVersion(version: string): string {
  const trimmed = version.trim();

  return trimmed === "" ? "неизвестно" : trimmed;
}

export function stageLabel(stage: InitStage): string {
  return STAGE_LABELS[stage];
}

export function formatBytesForResources(bytes: number): string {
  if (bytes <= 0) {
    return "0 Б";
  }

  const units = ["Б", "КиБ", "МиБ", "ГиБ"];
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
    return t("settings.resources.integrityOk").replace(
      "{count}",
      String(report.total)
    );
  }

  if (report.missing.length > 0 && report.modified.length > 0) {
    return t("settings.resources.integrityMixed")
      .replace("{missing}", String(report.missing.length))
      .replace("{modified}", String(report.modified.length));
  }

  if (report.missing.length > 0) {
    return t("settings.resources.integrityMissing").replace(
      "{count}",
      String(report.missing.length)
    );
  }

  return t("settings.resources.integrityModified").replace(
    "{count}",
    String(report.modified.length)
  );
}

export function shortKey(key: string): string {
  const parts = key.split("/");
  const name = parts[parts.length - 1];

  return name === undefined || name === "" ? key : name;
}
