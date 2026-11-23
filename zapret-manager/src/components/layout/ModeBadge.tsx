// Импортируем зависимости из модуля lucide-react.
import { Lock } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/selectors.
import { useConnectionStatus } from "@/stores/selectors";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ModeBadgeProps {
  // Обрабатываем конструкцию: onClick.
  onClick?: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию ModeBadge.
function ModeBadge({ onClick }: ModeBadgeProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const status = useConnectionStatus().
  const status = useConnectionStatus();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const { label, tone } = status === vpn ? { label: t(set….
  const { label, tone } =
    // Обрабатываем конструкцию: status.
    status === "vpn"
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        { label: t("settings.vpn.badgeVpn"), tone: "vpn" as const }
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        status === "connected"
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          { label: t("settings.vpn.badgeDpi"), tone: "dpi" as const }
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          { label: t("settings.vpn.badgeOff"), tone: "off" as const };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <button type=button onClick={onClick} aria-label={t(s….
  return (
    // Обрабатываем конструкцию: <button type=button onClick={onClick} aria-label={t(set….
    <button
      // Обрабатываем конструкцию: type.
      type="button"
      // Обрабатываем конструкцию: onClick.
      onClick={onClick}
      // Обрабатываем конструкцию: aria-label.
      aria-label={t("settings.vpn.badgeAriaLabel").replace("{mode}", label)}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: inline-flex items-center gap-1.5 rounded-full px-2.5 py….
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        // Обрабатываем конструкцию: text-[11px] font-semibold tracking-wide transition-colo….
        "text-[11px] font-semibold tracking-wide transition-colors",
        // Обрабатываем конструкцию: tone.
        tone === "vpn" && "bg-accent-secondary/15 text-accent-secondary",
        // Обрабатываем конструкцию: tone.
        tone === "dpi" && "bg-accent-primary/15 text-accent-primary",
        // Обрабатываем конструкцию: tone.
        tone === "off" && "text-text-tertiary bg-glass-bg"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <Lock
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className={cn("size-3", tone === "off" ? "opacity-50" : "opacity-90")}
        // Обрабатываем конструкцию: strokeWidth.
        strokeWidth={2.5}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      {label}
      {/* Выводим текстовое содержимое в JSX. */}
    </button>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default ModeBadge;.
export default ModeBadge;
// — разделитель логических блоков —
