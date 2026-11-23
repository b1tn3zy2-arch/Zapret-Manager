// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Lock, Zap } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/lib/constants.
import { ANIMATION, type DashboardMode } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/vpnConstants.
import { SWITCH_STEP_LABELS } from "@/lib/vpnConstants";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { SwitchStep } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ModeSwitcherProps {
  // Обрабатываем конструкцию: mode.
  mode: DashboardMode;
  // Обрабатываем конструкцию: switchStep.
  switchStep: SwitchStep | null;
  // Обрабатываем конструкцию: isSwitching.
  isSwitching: boolean;
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Обрабатываем конструкцию: onChange.
  onChange: (mode: DashboardMode) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function ModeSwitcher({
  // Обрабатываем конструкцию: mode.
  mode,
  // Обрабатываем конструкцию: switchStep.
  switchStep,
  // Обрабатываем конструкцию: isSwitching.
  isSwitching,
  // Обрабатываем конструкцию: disabled.
  disabled = false,
  // Обрабатываем конструкцию: onChange.
  onChange,
  // Закрываем текущий блок.
}: ModeSwitcherProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { reduced: reducedMotion } = useMotionPreference(….
  const { reduced: reducedMotion } = useMotionPreference();
  // Обрабатываем конструкцию: const isVpn = mode === vpn.
  const isVpn = mode === "vpn";
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const caption = isSwitching ? switchStep !== null ? t(S….
  const caption = isSwitching
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      switchStep !== null
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        t(SWITCH_STEP_LABELS[switchStep])
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        t("settings.vpn.switching")
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      isVpn
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        t("dashboard.modeSwitcher.activeVpn")
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        t("dashboard.modeSwitcher.activeDpi");
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const thumbTransition = reducedMotion ? { duration: 0 }….
  const thumbTransition = reducedMotion
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      { duration: 0 }
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.7 };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col items-end gap-2> <div ro….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col items-end gap-2>.
    <div className="flex flex-col items-end gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <div
        // Обрабатываем конструкцию: role.
        role="radiogroup"
        // Обрабатываем конструкцию: aria-label.
        aria-label={t("dashboard.modeSwitcher.ariaLabel")}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: border-glass-border bg-glass-bg relative flex h-12 item….
          "border-glass-border bg-glass-bg relative flex h-12 items-center",
          // Обрабатываем конструкцию: w-[clamp(190px,18vw,260px)] rounded-full border p-1.
          "w-[clamp(190px,18vw,260px)] rounded-full border p-1"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <motion.span
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: initial.
          initial={false}
          // Обрабатываем конструкцию: animate.
          animate={{ x: isVpn ? "100%" : "0%" }}
          // Обрабатываем конструкцию: transition.
          transition={thumbTransition}
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounde….
            "absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full",
            // Обрабатываем конструкцию: transition-[background-color,box-shadow] duration-200.
            "transition-[background-color,box-shadow] duration-200",
            // Обрабатываем конструкцию: isVpn.
            isVpn
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                "bg-accent-secondary shadow-[0_0_16px_rgb(var(--color-accent-secondary-rgb)/0.45)]"
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                "bg-accent-primary shadow-[0_0_16px_rgb(var(--color-accent-primary-rgb)/0.45)]"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {(["dpi", "vpn"] as const).map((value) => {
          // Обрабатываем конструкцию: const active = value === mode.
          const active = value === mode;
          // Обрабатываем конструкцию: const Icon = value === vpn ? Lock : Zap.
          const Icon = value === "vpn" ? Lock : Zap;
          // — разделитель логических блоков —

          // Возвращаем результат: ( <button key={value} type=button role=radio aria-check….
          return (
            // Обрабатываем конструкцию: <button key={value} type=button role=radio aria-checked….
            <button
              // Обрабатываем конструкцию: key.
              key={value}
              // Обрабатываем конструкцию: type.
              type="button"
              // Обрабатываем конструкцию: role.
              role="radio"
              // Обрабатываем конструкцию: aria-checked.
              aria-checked={active}
              // Обрабатываем конструкцию: aria-label.
              aria-label={t(
                // Обрабатываем конструкцию: value.
                value === "vpn"
                  ? // Обрабатываем конструкцию: ?.
                    // Продолжаем предыдущую конструкцию.
                    "dashboard.modeSwitcher.switchToVpn"
                  : // Обрабатываем конструкцию: :.
                    // Продолжаем предыдущую конструкцию.
                    "dashboard.modeSwitcher.switchToDpi"
                // Закрываем выражение или список аргументов.
              )}
              // Обрабатываем конструкцию: disabled.
              disabled={disabled || isSwitching}
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Обрабатываем конструкцию: onChange.
                onChange(value);
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: className.
              className={cn(
                // Обрабатываем конструкцию: relative z-10 flex flex-1 items-center justify-center g….
                "relative z-10 flex flex-1 items-center justify-center gap-1.5",
                // Обрабатываем конструкцию: rounded-full text-xs font-medium transition-colors.
                "rounded-full text-xs font-medium transition-colors",
                // Обрабатываем конструкцию: duration-200 disabled:cursor-not-allowed disabled:opaci….
                "duration-200 disabled:cursor-not-allowed disabled:opacity-50",
                // Обрабатываем конструкцию: active.
                active
                  ? // Обрабатываем конструкцию: ?.
                    // Продолжаем предыдущую конструкцию.
                    "text-on-accent"
                  : // Обрабатываем конструкцию: :.
                    // Продолжаем предыдущую конструкцию.
                    "text-text-tertiary hover:text-text-secondary"
                // Закрываем выражение или список аргументов.
              )}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <Icon
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="size-4 shrink-0"
                // Обрабатываем конструкцию: strokeWidth.
                strokeWidth={2.5}
                // Продолжаем выражение.
              />
              {/* Выводим текстовое содержимое в JSX. */}
              <span>
                {/* Выводим текстовое содержимое в JSX. */}
                {t(
                  // Обрабатываем конструкцию: value.
                  value === "vpn"
                    ? // Обрабатываем конструкцию: ?.
                      // Продолжаем предыдущую конструкцию.
                      "dashboard.modeSwitcher.vpn"
                    : // Обрабатываем конструкцию: :.
                      // Продолжаем предыдущую конструкцию.
                      "dashboard.modeSwitcher.dpi"
                  // Закрываем выражение или список аргументов.
                )}
                {/* Выводим текстовое содержимое в JSX. */}
              </span>
              {/* Выводим текстовое содержимое в JSX. */}
            </button>
            // Закрываем выражение или список аргументов.
          );
          // Закрываем текущий блок.
        })}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex min-h-4 items-center justify-end">
        {/* Выводим текстовое содержимое в JSX. */}
        <AnimatePresence initial={false}>
          {/* Выводим текстовое содержимое в JSX. */}
          <motion.p
            // Обрабатываем конструкцию: key.
            key={caption}
            // Обрабатываем конструкцию: aria-live.
            aria-live="polite"
            // Обрабатываем конструкцию: initial.
            initial={{ opacity: 0, y: 4 }}
            // Обрабатываем конструкцию: animate.
            animate={{ opacity: 1, y: 0 }}
            // Обрабатываем конструкцию: exit.
            exit={{ opacity: 0, y: -4 }}
            // Обрабатываем конструкцию: transition.
            transition={{ duration: reducedMotion ? 0 : ANIMATION.fast }}
            // Обрабатываем конструкцию: className.
            className="text-text-tertiary text-right text-xs"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {caption}
            {/* Выводим текстовое содержимое в JSX. */}
          </motion.p>
          {/* Выводим текстовое содержимое в JSX. */}
        </AnimatePresence>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
