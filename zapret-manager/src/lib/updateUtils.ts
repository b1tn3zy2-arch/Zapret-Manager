import { UPDATE_UNKNOWN_VERSION } from "@/lib/constants";

export function normalizeVersion(value: string): string {
  const trimmed = value.trim().replace(/^[vV]/, "").split(/[-+]/)[0] ?? "";

  return trimmed.trim() === "" ? UPDATE_UNKNOWN_VERSION : trimmed.trim();
}

export function formatVersion(value: string): string {
  const normalized = normalizeVersion(value);

  return normalized === UPDATE_UNKNOWN_VERSION ? "неизвестно" : normalized;
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
    return "дата неизвестна";
  }

  const parsed = new Date(iso);

  if (Number.isNaN(parsed.getTime())) {
    return "дата неизвестна";
  }

  return parsed.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatEta(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) {
    return "осталось неизвестно";
  }

  if (seconds < 60) {
    return `осталось ~${Math.ceil(seconds)} сек`;
  }

  const minutes = Math.ceil(seconds / 60);

  return `осталось ~${minutes} мин`;
}

const REPO_PATTERN = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

export function isValidRepo(value: string): boolean {
  return REPO_PATTERN.test(value.trim());
}

export function versionWithoutPrefix(value: string): string {
  return value.trim().replace(/^[vV]/, "");
}
