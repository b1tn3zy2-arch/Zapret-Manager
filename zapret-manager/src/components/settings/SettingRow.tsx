// Импортируем зависимости из модуля react.
import type { ReactNode } from "react";
// Импортируем зависимости из модуля lucide-react.
import { CircleHelp } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui/Tooltip.
import Tooltip from "@/components/ui/Tooltip";
// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SettingRowProps {
  // Обрабатываем конструкцию: label.
  label: string;
  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Пояснение к настройке. Раньше оно всегда рисовалось строко…
   * Пояснение к настройке. Раньше оно всегда рисовалось строкой под названием и
   // Сохраняем пояснение разработчика: * превращало список настроек в простыню текста; теперь текст…
   * превращало список настроек в простыню текста; теперь текст живёт в
   // Сохраняем пояснение разработчика: * подсказке и появляется только при наведении на название ил…
   * подсказке и появляется только при наведении на название или на значок
   // Сохраняем пояснение разработчика: * «?», как в нормальных программах.
   * «?», как в нормальных программах.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: description.
  description?: string;
  // Обрабатываем конструкцию: control.
  control: ReactNode;
  // Обрабатываем конструкцию: error.
  error?: string | null;
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Обрабатываем конструкцию: stacked.
  stacked?: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию SettingRow.
function SettingRow({
  // Обрабатываем конструкцию: label.
  label,
  // Обрабатываем конструкцию: description.
  description,
  // Обрабатываем конструкцию: control.
  control,
  // Обрабатываем конструкцию: error.
  error = null,
  // Обрабатываем конструкцию: disabled.
  disabled = false,
  // Обрабатываем конструкцию: stacked.
  stacked = false,
  // Закрываем текущий блок.
}: SettingRowProps) {
  // Возвращаем результат: ( <div className={cn( flex gap-3 py-3, stacked ? flex-c….
  return (
    // Обрабатываем конструкцию: <div className={cn( flex gap-3 py-3, stacked ? flex-col….
    <div
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: flex gap-3 py-3.
        "flex gap-3 py-3",
        // Обрабатываем конструкцию: stacked.
        stacked
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            "flex-col items-stretch"
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            "items-center justify-between gap-6"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex min-w-0 flex-col gap-0.5">
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="flex min-w-0 items-center gap-1.5">
          {/* Выводим текстовое содержимое в JSX. */}
          <span
            // Обрабатываем конструкцию: className.
            className={cn(
              // Обрабатываем конструкцию: text-text-primary text-sm font-medium.
              "text-text-primary text-sm font-medium",
              // Обрабатываем конструкцию: disabled.
              disabled && "opacity-50"
              // Закрываем выражение или список аргументов.
            )}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {label}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {description === undefined ? null : (
            // Обрабатываем конструкцию: <Tooltip content={description}>.
            <Tooltip content={description}>
              {/* Выводим текстовое содержимое в JSX. */}
              <button
                // Обрабатываем конструкцию: type.
                type="button"
                // Обрабатываем конструкцию: tabIndex.
                tabIndex={0}
                // Обрабатываем конструкцию: aria-label.
                aria-label={translateKey("common.hint")}
                // Обрабатываем конструкцию: className.
                className={cn(
                  // Обрабатываем конструкцию: text-text-tertiary hover:text-text-secondary.
                  "text-text-tertiary hover:text-text-secondary",
                  // Обрабатываем конструкцию: focus-visible:ring-accent-primary/60 shrink-0 rounded-f….
                  "focus-visible:ring-accent-primary/60 shrink-0 rounded-full p-0.5",
                  // Обрабатываем конструкцию: transition-colors focus-visible:ring-2 focus-visible:ou….
                  "transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  // Закрываем выражение или список аргументов.
                )}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                <CircleHelp aria-hidden="true" className="size-3.5" />
                {/* Выводим текстовое содержимое в JSX. */}
              </button>
              {/* Выводим текстовое содержимое в JSX. */}
            </Tooltip>
            // Закрываем выражение или список аргументов.
          )}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {error !== null ? (
          // Обрабатываем конструкцию: <span className=text-accent-danger text-xs>.
          <span className="text-accent-danger text-xs">{error}</span>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className={cn("shrink-0", stacked && "w-full")}>{control}</div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default SettingRow;.
export default SettingRow;
// — разделитель логических блоков —
