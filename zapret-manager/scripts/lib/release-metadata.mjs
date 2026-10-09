import { readdirSync } from "node:fs";
import { join } from "node:path";

export const PLACEHOLDER = "USER/zapret-manager";
export const UPSTREAM_ISSUES =
  "github.com/Flowseal/zapret-discord-youtube/issues";

const REPO_URL_PATTERN = /APP_REPOSITORY_URL\s*=\s*"([^"]+)"/;

export function extractRepoUrl(source) {
  return source?.match(REPO_URL_PATTERN)?.[1];
}

export function bareRepo(repoUrl) {
  return typeof repoUrl === "string"
    ? repoUrl.replace("https://github.com/", "")
    : "";
}

export function isPlaceholder(value) {
  return typeof value !== "string" || value.includes(PLACEHOLDER);
}

export function collectBundleFiles(distDir) {
  return readdirSync(distDir, { recursive: true })
    .map((entry) => join(distDir, String(entry)))
    .filter((path) => path.endsWith(".js") || path.endsWith(".css"));
}

export function checkDocument(
  name,
  content,
  { allowPlaceholder = false } = {}
) {
  const problems = [];

  if (content === null || content === undefined) {
    return [`${name} не найден`];
  }
  if (!allowPlaceholder && content.includes(PLACEHOLDER)) {
    problems.push(
      `${name} содержит плейсхолдер ${PLACEHOLDER} — укажите реальный репозиторий`
    );
  }
  if (content.includes(UPSTREAM_ISSUES)) {
    problems.push(
      `${name} отправляет баг-репорты в upstream-репозиторий zapret`
    );
  }

  return problems;
}

export function checkBundleFile(
  { name, content },
  { allowPlaceholder = false } = {}
) {
  const problems = [];

  if (!allowPlaceholder && content.includes(PLACEHOLDER)) {
    problems.push(`${name}: в бандле остался плейсхолдер ${PLACEHOLDER}`);
  }
  if (content.includes(UPSTREAM_ISSUES)) {
    problems.push(
      `${name}: в бандле ссылка на issues upstream-репозитория zapret`
    );
  }

  return problems;
}

export function checkBundleFreshness(
  bundleText,
  repoUrl,
  { allowPlaceholder = false } = {}
) {
  const repo = bareRepo(repoUrl);

  if (
    allowPlaceholder ||
    !repo ||
    repo.includes(PLACEHOLDER) ||
    bundleText.includes(repo)
  ) {
    return [];
  }

  return [
    `бандл собран до подстановки репозитория: в нём нет ${repo}. Пересоберите: pnpm build`,
  ];
}
