// Импортируем зависимости из модуля react.
import { memo } from "react";
// Импортируем зависимости из модуля lucide-react.
import { RefreshCw } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/CountryFlag.
import CountryFlag from "@/components/dashboard/CountryFlag";
// Импортируем зависимости из модуля @/hooks/useNetworkInfo.
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const EMPTY = —.
const EMPTY = "—";
// — разделитель логических блоков —

// Объявляем функцию ConnectionStrip.
function ConnectionStrip() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { info, isLoading, refresh } = useNetworkInfo().
  const { info, isLoading, refresh } = useNetworkInfo();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <span className=flex flex-wrap items-center gap-x-3 g….
  return (
    // Обрабатываем конструкцию: <span className=flex flex-wrap items-center gap-x-3 gap….
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      {/* Выводим текстовое содержимое в JSX. */}
      {info === null ? (
        // Рендерим самозакрывающийся элемент span.
        <span className="border-glass-border bg-glass-bg size-4 shrink-0 rounded-full border" />
      ) : (
        // Продолжаем предыдущую конструкцию.
        // Закрываем выражение или список аргументов.
        // Рендерим самозакрывающийся элемент CountryFlag.
        <CountryFlag
          // Обрабатываем конструкцию: countryCode.
          countryCode={info.countryCode}
          // Обрабатываем конструкцию: countryName.
          countryName={info.country}
          // Обрабатываем конструкцию: size.
          size={16}
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-secondary">
        {/* Выводим текстовое содержимое в JSX. */}
        {info?.country || EMPTY}
        {/* Выводим текстовое содержимое в JSX. */}
        {info?.city === undefined ? "" : ` · ${info.city}`}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-primary font-mono">{info?.ip || EMPTY}</span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-tertiary truncate">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("dashboard.connection.isp")}: {info?.isp || EMPTY}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
      <button
        // Обрабатываем конструкцию: type.
        type="button"
        // Обрабатываем конструкцию: aria-label.
        aria-label={t("dashboard.connection.refreshAria")}
        // Обрабатываем конструкцию: disabled.
        disabled={isLoading}
        // Обрабатываем конструкцию: onClick.
        onClick={() => {
          // Обрабатываем конструкцию: void refresh().
          void refresh();
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: text-text-tertiary hover:text-text-primary rounded p-0.….
          "text-text-tertiary hover:text-text-primary rounded p-0.5 transition-colors",
          // Обрабатываем конструкцию: disabled:cursor-not-allowed disabled:opacity-50.
          "disabled:cursor-not-allowed disabled:opacity-50"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <RefreshCw
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className={isLoading ? "size-3 animate-spin" : "size-3"}
          // Обрабатываем конструкцию: strokeWidth.
          strokeWidth={2}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </button>
      {/* Выводим текстовое содержимое в JSX. */}
    </span>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default memo(ConnectionStrip);.
export default memo(ConnectionStrip);
// — разделитель логических блоков —
