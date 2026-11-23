// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { SpinnerSize } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SpinnerProps {
  // Обрабатываем конструкцию: size.
  size?: SpinnerSize;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PIXEL_SIZE = { sm: 16, md: 24, lg: 32, } as const….
const PIXEL_SIZE = {
  // Обрабатываем конструкцию: sm.
  sm: 16,
  // Обрабатываем конструкцию: md.
  md: 24,
  // Обрабатываем конструкцию: lg.
  lg: 32,
  // Закрываем текущий блок.
} as const satisfies Record<SpinnerSize, number>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Spinner({ size = "md", className }: SpinnerProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const pixels = PIXEL_SIZE[size].
  const pixels = PIXEL_SIZE[size];
  // — разделитель логических блоков —

  // Возвращаем результат: ( <svg role=status aria-label={t(ui.loading)} viewBox=0….
  return (
    // Обрабатываем конструкцию: <svg role=status aria-label={t(ui.loading)} viewBox=0 0….
    <svg
      // Обрабатываем конструкцию: role.
      role="status"
      // Обрабатываем конструкцию: aria-label.
      aria-label={t("ui.loading")}
      // Обрабатываем конструкцию: viewBox.
      viewBox="0 0 24 24"
      // Обрабатываем конструкцию: width.
      width={pixels}
      // Обрабатываем конструкцию: height.
      height={pixels}
      // Обрабатываем конструкцию: fill.
      fill="none"
      // Обрабатываем конструкцию: className.
      className={cn("animate-spin text-current", className)}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <circle
        // Обрабатываем конструкцию: cx.
        cx="12"
        // Обрабатываем конструкцию: cy.
        cy="12"
        // Обрабатываем конструкцию: r.
        r="9"
        // Обрабатываем конструкцию: stroke.
        stroke="currentColor"
        // Обрабатываем конструкцию: strokeWidth.
        strokeWidth="2"
        // Обрабатываем конструкцию: strokeOpacity.
        strokeOpacity="0.25"
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <path
        // Обрабатываем конструкцию: d.
        d="M21 12a9 9 0 0 0-9-9"
        // Обрабатываем конструкцию: stroke.
        stroke="currentColor"
        // Обрабатываем конструкцию: strokeWidth.
        strokeWidth="2"
        // Обрабатываем конструкцию: strokeLinecap.
        strokeLinecap="round"
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </svg>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
