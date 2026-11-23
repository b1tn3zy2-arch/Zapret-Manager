// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Power } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/lib/vpnConstants.
import { SWITCH_STEP_LABELS } from "@/lib/vpnConstants";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { SwitchStep } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ConnectButtonProps {
  // Обрабатываем конструкцию: connected.
  connected: boolean;
  // Обрабатываем конструкцию: connecting.
  connecting: boolean;
  // Обрабатываем конструкцию: isSwitching.
  isSwitching: boolean;
  // Обрабатываем конструкцию: switchStep.
  switchStep: SwitchStep | null;
  // Обрабатываем конструкцию: activeServerName.
  activeServerName: string | null;
  // Сохраняем пояснение разработчика: Кнопка не нажимается: VPN выключен, нет сервера или идёт под…
  /** Кнопка не нажимается: VPN выключен, нет сервера или идёт подключение. */
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Сохраняем пояснение разработчика: VPN выключен в настройках — показываем отдельную подсказку.
  /** VPN выключен в настройках — показываем отдельную подсказку. */
  // Обрабатываем конструкцию: vpnDisabled.
  vpnDisabled?: boolean;
  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Своя подпись под кнопкой. Если не задана, берётся по
   * Своя подпись под кнопкой. Если не задана, берётся по
   // Сохраняем пояснение разработчика: * состоянию из словаря.
   * состоянию из словаря.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: caption.
  caption?: string;
  // Обрабатываем конструкцию: onClick.
  onClick: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function ConnectButton({
  // Обрабатываем конструкцию: connected.
  connected,
  // Обрабатываем конструкцию: connecting.
  connecting,
  // Обрабатываем конструкцию: isSwitching.
  isSwitching,
  // Обрабатываем конструкцию: switchStep.
  switchStep,
  // Обрабатываем конструкцию: activeServerName.
  activeServerName,
  // Обрабатываем конструкцию: disabled.
  disabled = false,
  // Обрабатываем конструкцию: vpnDisabled.
  vpnDisabled = false,
  // Обрабатываем конструкцию: caption.
  caption: captionOverride,
  // Обрабатываем конструкцию: onClick.
  onClick,
  // Закрываем текущий блок.
}: ConnectButtonProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { reduced } = useMotionPreference().
  const { reduced } = useMotionPreference();
  // Обрабатываем конструкцию: const isBusy = connecting || isSwitching.
  const isBusy = connecting || isSwitching;
  // Обрабатываем конструкцию: const state = connected ? on : off.
  const state = connected ? "on" : "off";
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const caption = captionOverride ?? (isBusy ? switchStep….
  const caption =
    // Обрабатываем конструкцию: captionOverride.
    captionOverride ??
    // Обрабатываем конструкцию: (isBusy ? switchStep !== null ? t(SWITCH_STEP_LABELS[sw….
    (isBusy
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        switchStep !== null
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          t(SWITCH_STEP_LABELS[switchStep])
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          t("dashboard.vpn.connecting")
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        connected
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          t("dashboard.vpn.connectedTo").replace(
            // Обрабатываем конструкцию: {name}.
            "{name}",
            // Обрабатываем конструкцию: activeServerName.
            activeServerName ?? ""
            // Закрываем выражение или список аргументов.
          )
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          vpnDisabled
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            t("dashboard.vpn.disabledHint")
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            t("dashboard.vpn.clickToConnect"));
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col items-center gap-4> <mot….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col items-center gap-4>.
    <div className="flex flex-col items-center gap-4">
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.button
        // Обрабатываем конструкцию: type.
        type="button"
        // Обрабатываем конструкцию: aria-label.
        aria-label={
          // Обрабатываем конструкцию: connected.
          connected
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t("dashboard.vpn.disconnectAria")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              t("dashboard.vpn.connectAria")
          // Закрываем текущий блок.
        }
        // Обрабатываем конструкцию: aria-busy.
        aria-busy={isBusy}
        // Обрабатываем конструкцию: disabled.
        disabled={isBusy || disabled}
        // Обрабатываем конструкцию: onClick.
        onClick={onClick}
        // Обрабатываем конструкцию: {...(reduced ? {} : { whileHover: { scale: 1.03 }, whil….
        {...(reduced
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            {}
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            { whileHover: { scale: 1.03 }, whileTap: { scale: 0.94 } })}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: relative flex items-center justify-center rounded-full ….
          "relative flex items-center justify-center rounded-full border-2",
          // Обрабатываем конструкцию: size-[clamp(160px,18vw,200px)].
          "size-[clamp(160px,18vw,200px)]",
          // Обрабатываем конструкцию: transition-[border-color,box-shadow] duration-300.
          "transition-[border-color,box-shadow] duration-300",
          // Обрабатываем конструкцию: disabled:cursor-not-allowed disabled:opacity-60.
          "disabled:cursor-not-allowed disabled:opacity-60",
          // Обрабатываем конструкцию: connected.
          connected
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              "border-accent-success shadow-[0_0_48px_rgb(var(--color-accent-success-rgb)/0.28)]"
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              isBusy
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                "border-accent-warning shadow-[0_0_32px_rgb(var(--color-accent-warning-rgb)/0.25)]"
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                "border-glass-border hover:border-accent-primary/40"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <AnimatePresence>
          {/* Выводим текстовое содержимое в JSX. */}
          {state === "on" ? (
            // Рендерим самозакрывающийся элемент motion.span.
            <motion.span
              // Обрабатываем конструкцию: key.
              key={state}
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: initial.
              initial={reduced ? false : { scale: 0.85, opacity: 0.75 }}
              // Обрабатываем конструкцию: animate.
              animate={{ scale: 1.45, opacity: 0 }}
              // Обрабатываем конструкцию: transition.
              transition={{ duration: reduced ? 0 : 0.65, ease: "easeOut" }}
              // Обрабатываем конструкцию: className.
              className="border-accent-success pointer-events-none absolute inset-0 rounded-full border-2"
              // Продолжаем выражение.
            />
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {connected ? (
            // Рендерим самозакрывающийся элемент motion.span.
            <motion.span
              // Обрабатываем конструкцию: key.
              key={`${state}-ring`}
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: initial.
              initial={reduced ? false : { opacity: 0.45 }}
              // Обрабатываем конструкцию: animate.
              animate={{ opacity: [0.45, 0.9, 0.45] }}
              // Обрабатываем конструкцию: transition.
              transition={{
                // Обрабатываем конструкцию: duration.
                duration: reduced ? 0 : 2.6,
                // Обрабатываем конструкцию: repeat.
                repeat: reduced ? 0 : Infinity,
                // Обрабатываем конструкцию: ease.
                ease: "easeInOut",
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: className.
              className="border-accent-success/40 pointer-events-none absolute -inset-1 rounded-full border"
              // Продолжаем выражение.
            />
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* Выводим текстовое содержимое в JSX. */}
        </AnimatePresence>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <motion.span
          // Обрабатываем конструкцию: animate.
          animate={
            // Обрабатываем конструкцию: reduced.
            reduced || !connected
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                { scale: 1 }
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                {
                  // Обрабатываем конструкцию: scale.
                  scale: [1, 1.08, 1],
                  // Обрабатываем конструкцию: transition.
                  transition: { duration: 2.6, repeat: Infinity },
                  // Закрываем текущий блок.
                }
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: className.
          className="flex items-center justify-center"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <motion.span
            // Обрабатываем конструкцию: className.
            className="flex items-center justify-center"
            // Обрабатываем конструкцию: {...(reduced ? {} : { // вращение только на время подкл….
            {...(reduced
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                {}
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                {
                  // Сохраняем пояснение разработчика: // вращение только на время подключения: постоянно крутящаяс…
                  // вращение только на время подключения: постоянно крутящаяся
                  // Сохраняем пояснение разработчика: // иконка переставала читаться как состояние и утомляла
                  // иконка переставала читаться как состояние и утомляла
                  // Обрабатываем конструкцию: animate.
                  animate: isBusy ? { rotate: 360 } : { rotate: 0 },
                  // Обрабатываем конструкцию: transition.
                  transition: {
                    // Обрабатываем конструкцию: duration.
                    duration: 1.6,
                    // Обрабатываем конструкцию: repeat.
                    repeat: isBusy ? Infinity : 0,
                    // Обрабатываем конструкцию: ease.
                    ease: "linear" as const,
                    // Закрываем текущий блок.
                  },
                  // Закрываем текущий блок.
                })}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <Power
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: className.
              className={cn(
                // Обрабатываем конструкцию: size-16 transition-colors duration-300.
                "size-16 transition-colors duration-300",
                // Обрабатываем конструкцию: connected.
                connected ? "text-accent-success" : "text-text-secondary"
                // Закрываем выражение или список аргументов.
              )}
              // Обрабатываем конструкцию: strokeWidth.
              strokeWidth={1.75}
              // Продолжаем выражение.
            />
            {/* Выводим текстовое содержимое в JSX. */}
          </motion.span>
          {/* Выводим текстовое содержимое в JSX. */}
        </motion.span>
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.button>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Text
        // Обрабатываем конструкцию: variant.
        variant="body"
        // Обрабатываем конструкцию: size.
        size="sm"
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: text-center.
          "text-center",
          // Обрабатываем конструкцию: connected.
          connected ? "text-accent-success" : "text-text-secondary"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {caption}
        {/* Выводим текстовое содержимое в JSX. */}
      </Text>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
