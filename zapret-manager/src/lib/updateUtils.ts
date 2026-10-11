import { currentLanguage } from "@/lib/format";
import { translateKey } from "@/i18n/core";
import { UPDATE_UNKNOWN_VERSION } from "@/lib/constants";

export function normalizeVersion(value: string): string {
  const trimmed = value.trim().replace(/^[vV]/, "").split(/[-+]/)[0] ?? "";

  return trimmed.trim() === "" ? UPDATE_UNKNOWN_VERSION : trimmed.trim();
}

export function formatVersion(value: string): string {
  const normalized = normalizeVersion(value);

  return normalized === UPDATE_UNKNOWN_VERSION
    ? translateKey("updateMeta.unknownVersion")
    : normalized;
}

export function isKnownVersion(value: string): boolean {
  return normalizeVersion(value) !== UPDATE_UNKNOWN_VERSION;
}

export function isVersionIgnored(version: string, ignored: string[]): boolean {
  const target = normalizeVersion(version);

  return ignored.some((value) => normalizeVersion(value) === target);
}

export function formatReleaseDate(iso: string): string {
  if (iso.trim() === "") {
    return translateKey("updateMeta.unknownDate");
  }

  const parsed = new Date(iso);

  if (Number.isNaN(parsed.getTime())) {
    return translateKey("updateMeta.unknownDate");
  }

  return parsed.toLocaleDateString(
    currentLanguage() === "ru" ? "ru-RU" : "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

export function formatEta(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) {
    return translateKey("updateMeta.remainingUnknown");
  }

  if (seconds < 60) {
    return translateKey("updateMeta.remainingSeconds", {
      seconds: Math.ceil(seconds),
    });
  }

  const minutes = Math.ceil(seconds / 60);

  return translateKey("updateMeta.remainingMinutes", { minutes });
}

const REPO_PATTERN = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

export function isValidRepo(value: string): boolean {
  return REPO_PATTERN.test(value.trim());
}

export function versionWithoutPrefix(value: string): string {
  return value.trim().replace(/^[vV]/, "");
}
