// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Lock, ShieldCheck, TriangleAlert, WifiOff } from "lucide-react";
// Импортируем зависимости из модуля react.
import { useEffect, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/constants.
import { CONNECTION_LABELS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/constants.
import type { ConnectionStatus } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/constants.
import { ANIMATION } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PALETTE = { connected: { ring: rgba(0, 255, 136, ….
const PALETTE = {
  // Обрабатываем конструкцию: connected.
  connected: {
    // Обрабатываем конструкцию: ring.
    ring: "rgba(0, 255, 136, 0.45)",
    // Обрабатываем конструкцию: core.
    core: "rgba(0, 255, 136, 0.18)",
    // Обрабатываем конструкцию: text.
    text: "text-accent-primary",
    // Обрабатываем конструкцию: Icon.
    Icon: ShieldCheck,
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: connecting.
  connecting: {
    // Обрабатываем конструкцию: ring.
    ring: "rgba(251, 191, 36, 0.45)",
    // Обрабатываем конструкцию: core.
    core: "rgba(251, 191, 36, 0.16)",
    // Обрабатываем конструкцию: text.
    text: "text-accent-warning",
    // Обрабатываем конструкцию: Icon.
    Icon: ShieldCheck,
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: disconnected.
  disconnected: {
    // Обрабатываем конструкцию: ring.
    ring: "rgba(255, 255, 255, 0.14)",
    // Обрабатываем конструкцию: core.
    core: "rgba(255, 255, 255, 0.05)",
    // Обрабатываем конструкцию: text.
    text: "text-text-tertiary",
    // Обрабатываем конструкцию: Icon.
    Icon: WifiOff,
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: vpn.
  vpn: {
    // Обрабатываем конструкцию: ring.
    ring: "rgba(0, 212, 255, 0.45)",
    // Обрабатываем конструкцию: core.
    core: "rgba(0, 212, 255, 0.18)",
    // Обрабатываем конструкцию: text.
    text: "text-accent-secondary",
    // Обрабатываем конструкцию: Icon.
    Icon: Lock,
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: error.
  error: {
    // Обрабатываем конструкцию: ring.
    ring: "rgba(255, 82, 82, 0.45)",
    // Обрабатываем конструкцию: core.
    core: "rgba(255, 82, 82, 0.16)",
    // Обрабатываем конструкцию: text.
    text: "text-accent-danger",
    // Обрабатываем конструкцию: Icon.
    Icon: TriangleAlert,
    // Закрываем текущий блок.
  },
  // Закрываем текущий блок.
} as const satisfies Record<
  // Обрабатываем конструкцию: ConnectionStatus.
  ConnectionStatus,
  // Обрабатываем конструкцию: { ring: string; core: string; text: string; Icon: typeo….
  { ring: string; core: string; text: string; Icon: typeof Lock }
  // Продолжаем выражение.
>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ACTIVE_STATUSES: ConnectionStatus[] = [connected,….
const ACTIVE_STATUSES: ConnectionStatus[] = ["connected", "connecting", "vpn"];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StatusOrbProps {
  // Обрабатываем конструкцию: status.
  status: ConnectionStatus;
  // Обрабатываем конструкцию: size.
  size?: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию StatusOrb.
function StatusOrb({ status, size }: StatusOrbProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { reduced } = useMotionPreference().
  const { reduced } = useMotionPreference();
  // Обрабатываем конструкцию: const palette = PALETTE[status].
  const palette = PALETTE[status];
  // Обрабатываем конструкцию: const isActive = ACTIVE_STATUSES.includes(status).
  const isActive = ACTIVE_STATUSES.includes(status);
  // Обрабатываем конструкцию: const { Icon } = palette.
  const { Icon } = palette;
  // Обрабатываем конструкцию: const diameter = size ?? undefined.
  const diameter = size ?? undefined;
  // Обрабатываем конструкцию: const [burstKey, setBurstKey] = useState(0).
  const [burstKey, setBurstKey] = useState(0);
  // Обрабатываем конструкцию: const previousStatus = useRef<ConnectionStatus | null>(….
  const previousStatus = useRef<ConnectionStatus | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const wasActive = previousStatus.current === connected ….
    const wasActive =
      // Обрабатываем конструкцию: previousStatus.
      previousStatus.current === "connected" ||
      // Обрабатываем конструкцию: previousStatus.
      previousStatus.current === "vpn";
    // Обрабатываем конструкцию: const isNowActive = status === connected || status === ….
    const isNowActive = status === "connected" || status === "vpn";
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: isNowActive && previousStatus.current !== null && !wasA….
    if (isNowActive && previousStatus.current !== null && !wasActive) {
      // Обрабатываем конструкцию: setBurstKey.
      setBurstKey((key) => key + 1);
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: previousStatus.
    previousStatus.current = status;
    // Закрываем текущий блок.
  }, [status]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=status-orb relative flex shrink-0 item….
  return (
    // Обрабатываем конструкцию: <div className=status-orb relative flex shrink-0 items-….
    <div
      // Обрабатываем конструкцию: className.
      className="status-orb relative flex shrink-0 items-center justify-center rounded-full"
      // Обрабатываем конструкцию: style.
      style={{
        // Обрабатываем конструкцию: width.
        width: diameter ?? "clamp(84px, 12vw, 148px)",
        // Обрабатываем конструкцию: height.
        height: diameter ?? "clamp(84px, 12vw, 148px)",
        // Обрабатываем конструкцию: boxShadow.
        boxShadow: isActive ? `0 0 26px 2px ${palette.ring}` : undefined,
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: role.
      role="img"
      // Обрабатываем конструкцию: aria-label.
      aria-label={t("dashboard.orb.aria", {
        // Обрабатываем конструкцию: status.
        status: t(CONNECTION_LABELS[status]),
        // Закрываем текущий блок.
      })}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {isActive && !reduced ? (
        // Обрабатываем конструкцию: <>.
        <>
          {/* Выводим текстовое содержимое в JSX. */}
          <motion.span
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: className.
            className="absolute inset-0 rounded-full"
            // Обрабатываем конструкцию: style.
            style={{
              // Обрабатываем конструкцию: border.
              border: `1px solid ${palette.ring}`,
              // Обрабатываем конструкцию: willChange.
              willChange: "transform, opacity",
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: animate.
            animate={{ scale: [1, 1.22, 1], opacity: [0.85, 0, 0.85] }}
            // Обрабатываем конструкцию: transition.
            transition={{
              // Обрабатываем конструкцию: duration.
              duration: 2.2,
              // Обрабатываем конструкцию: repeat.
              repeat: Infinity,
              // Обрабатываем конструкцию: ease.
              ease: ANIMATION.easeInOutExpo,
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <motion.span
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: className.
            className="absolute inset-3 rounded-full"
            // Обрабатываем конструкцию: style.
            style={{
              // Обрабатываем конструкцию: border.
              border: `1px solid ${palette.ring}`,
              // Обрабатываем конструкцию: willChange.
              willChange: "transform, opacity",
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: animate.
            animate={{ scale: [1, 1.34, 1], opacity: [0.6, 0, 0.6] }}
            // Обрабатываем конструкцию: transition.
            transition={{
              // Обрабатываем конструкцию: duration.
              duration: 2.2,
              // Обрабатываем конструкцию: repeat.
              repeat: Infinity,
              // Обрабатываем конструкцию: delay.
              delay: 0.55,
              // Обрабатываем конструкцию: ease.
              ease: ANIMATION.easeInOutExpo,
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          {burstKey > 0 && !reduced ? (
            // Рендерим самозакрывающийся элемент motion.span.
            <motion.span
              // Обрабатываем конструкцию: key.
              key={burstKey}
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: className.
              className="absolute inset-0 rounded-full"
              // Обрабатываем конструкцию: style.
              style={{ border: `2px solid ${palette.ring}` }}
              // Обрабатываем конструкцию: initial.
              initial={{ scale: 0.85, opacity: 0.9 }}
              // Обрабатываем конструкцию: animate.
              animate={{ scale: 1.55, opacity: 0 }}
              // Обрабатываем конструкцию: transition.
              transition={{ duration: 0.9, ease: "easeOut" }}
              // Продолжаем выражение.
            />
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* Выводим текстовое содержимое в JSX. */}
        </>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div
        // Обрабатываем конструкцию: className.
        className={`absolute inset-5 rounded-full ${palette.text} flex items-center justify-center`}
        // Обрабатываем конструкцию: style.
        style={{ background: palette.core, willChange: "transform" }}
        // Обрабатываем конструкцию: animate.
        animate={
          // Обрабатываем конструкцию: isActive.
          isActive
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              {
                // Обрабатываем конструкцию: scale.
                scale: status === "connecting" ? [1, 1.06, 1] : [1, 1.035, 1],
                // Закрываем текущий блок.
              }
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              { scale: 1 }
          // Закрываем текущий блок.
        }
        // Обрабатываем конструкцию: transition.
        transition={{
          // Обрабатываем конструкцию: duration.
          duration: status === "connecting" ? 1.6 : 2.6,
          // Обрабатываем конструкцию: repeat.
          repeat: isActive ? Infinity : 0,
          // Обрабатываем конструкцию: ease.
          ease: "easeInOut",
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <motion.span
          // Обрабатываем конструкцию: key.
          key={status}
          // Обрабатываем конструкцию: className.
          className="flex size-full items-center justify-center"
          // Обрабатываем конструкцию: initial.
          initial={{ opacity: 0, scale: 0.8 }}
          // Обрабатываем конструкцию: animate.
          animate={{ opacity: 1, scale: 1 }}
          // Обрабатываем конструкцию: transition.
          transition={{ duration: ANIMATION.normal }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <Icon aria-hidden="true" className="size-[38%]" strokeWidth={1.75} />
          {/* Выводим текстовое содержимое в JSX. */}
        </motion.span>
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default StatusOrb;.
export default StatusOrb;
// — разделитель логических блоков —
