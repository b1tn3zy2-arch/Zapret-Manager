// Импортируем зависимости из модуля lucide-react.
import { Loader2 } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/installedGames.
import { SOURCE_LABEL_KEYS } from "@/lib/installedGames";
// Импортируем зависимости из модуля @/types.
import type { GameCoverProgress, GameScanProgress } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameScanIndicatorProps {
  // Обрабатываем конструкцию: scanning.
  scanning: boolean;
  // Обрабатываем конструкцию: found.
  found: number;
  // Обрабатываем конструкцию: progress.
  progress: GameScanProgress | null;
  // Сохраняем пояснение разработчика: Ход докачки обложек.
  /** Ход докачки обложек. */
  // Обрабатываем конструкцию: coverProgress.
  coverProgress: GameCoverProgress | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function GameScanIndicator({
  // Обрабатываем конструкцию: scanning.
  scanning,
  // Обрабатываем конструкцию: found.
  found,
  // Обрабатываем конструкцию: progress.
  progress,
  // Обрабатываем конструкцию: coverProgress.
  coverProgress,
  // Закрываем текущий блок.
}: GameScanIndicatorProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !scanning.
  if (!scanning) {
    // Возвращаем результат: ( <span className=flex items-center gap-3> <span classN….
    return (
      // Обрабатываем конструкцию: <span className=flex items-center gap-3>.
      <span className="flex items-center gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-tertiary text-sm" data-testid="games-found">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.installed.count", { count: found })}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {coverProgress !== null &&
        // Обрабатываем конструкцию: coverProgress.
        coverProgress.current < coverProgress.total ? (
          // Обрабатываем конструкцию: <span role=status aria-live=polite className=text-text-….
          <span
            // Обрабатываем конструкцию: role.
            role="status"
            // Обрабатываем конструкцию: aria-live.
            aria-live="polite"
            // Обрабатываем конструкцию: className.
            className="text-text-secondary flex items-center gap-2 text-sm"
            // Обрабатываем конструкцию: data-testid.
            data-testid="games-covers-progress"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.scan.covers", {
              // Обрабатываем конструкцию: current.
              current: coverProgress.current,
              // Обрабатываем конструкцию: total.
              total: coverProgress.total,
              // Закрываем текущий блок.
            })}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const source = progress?.source.
  const source = progress?.source;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <span role=status aria-live=polite className=text-tex….
  return (
    // Обрабатываем конструкцию: <span role=status aria-live=polite className=text-text-….
    <span
      // Обрабатываем конструкцию: role.
      role="status"
      // Обрабатываем конструкцию: aria-live.
      aria-live="polite"
      // Обрабатываем конструкцию: className.
      className="text-text-secondary flex items-center gap-2 text-sm"
      // Обрабатываем конструкцию: data-testid.
      data-testid="games-scanning"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      {/* Выводим текстовое содержимое в JSX. */}
      {source === undefined
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          t("settings.games.installed.scan.searching")
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          t("settings.games.installed.scan.source", {
            // Обрабатываем конструкцию: source.
            source: t(SOURCE_LABEL_KEYS[source]),
            // Закрываем текущий блок.
          })}
      {/* Выводим текстовое содержимое в JSX. */}
    </span>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
