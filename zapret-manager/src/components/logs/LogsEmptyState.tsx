// Импортируем зависимости из модуля lucide-react.
import { SearchX, Terminal } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type LogsEmptyVariant = "empty" | "no-match" | "disabled";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LogsEmptyStateProps {
  // Обрабатываем конструкцию: variant.
  variant: LogsEmptyVariant;
  // Обрабатываем конструкцию: onReset.
  onReset?: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию LogsEmptyState.
function LogsEmptyState({ variant, onReset }: LogsEmptyStateProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: variant === no-match.
  if (variant === "no-match") {
    // Возвращаем результат: ( <div className=flex min-h-[40vh] flex-col items-cente….
    return (
      // Обрабатываем конструкцию: <div className=flex min-h-[40vh] flex-col items-center ….
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="bg-glass-bg text-text-tertiary flex size-16 items-center justify-center rounded-full">
          {/* Выводим текстовое содержимое в JSX. */}
          <SearchX className="size-7" />
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <h3 className="text-text-primary text-lg font-semibold">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("logs.noMatchTitle")}
          {/* Выводим текстовое содержимое в JSX. */}
        </h3>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <p className="text-text-secondary max-w-md text-sm">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("logs.noMatchDesc")}
          {/* Выводим текстовое содержимое в JSX. */}
        </p>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {onReset === undefined ? null : (
          // Обрабатываем конструкцию: <button type=button onClick={onReset} className={cn( te….
          <button
            // Обрабатываем конструкцию: type.
            type="button"
            // Обрабатываем конструкцию: onClick.
            onClick={onReset}
            // Обрабатываем конструкцию: className.
            className={cn(
              // Обрабатываем конструкцию: text-text-primary border-glass-border hover:bg-glass-ho….
              "text-text-primary border-glass-border hover:bg-glass-hover mt-1",
              // Обрабатываем конструкцию: rounded-lg border px-4 py-2 text-sm transition-colors.
              "rounded-lg border px-4 py-2 text-sm transition-colors"
              // Закрываем выражение или список аргументов.
            )}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("logs.resetFilters")}
            {/* Выводим текстовое содержимое в JSX. */}
          </button>
          // Закрываем выражение или список аргументов.
        )}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex min-h-[40vh] flex-col items-cente….
  return (
    // Обрабатываем конструкцию: <div className=flex min-h-[40vh] flex-col items-center ….
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="bg-glass-bg text-text-secondary flex size-16 items-center justify-center rounded-full">
        {/* Выводим текстовое содержимое в JSX. */}
        <Terminal className="size-7" />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <h3 className="text-text-secondary text-lg font-semibold">
        {/* Выводим текстовое содержимое в JSX. */}
        {variant === "disabled"
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            t("logs.disabledTitle")
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            t("logs.emptyTitle")}
        {/* Выводим текстовое содержимое в JSX. */}
      </h3>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <p className="text-text-secondary max-w-md text-sm">
        {/* Выводим текстовое содержимое в JSX. */}
        {variant === "disabled" ? t("logs.disabledDesc") : t("logs.emptyDesc")}
        {/* Выводим текстовое содержимое в JSX. */}
      </p>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default LogsEmptyState;.
export default LogsEmptyState;
// — разделитель логических блоков —
