import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useState } from "react";

/**
 * Появление карточки в сетке.
 *
 * Размытие при входе снимается сразу после анимации, и это не украшение:
 * пока на обёртке висит любой `filter` (даже `blur(0px)`), браузер считает её
 * плоскостью, `preserve-3d` внутри схлопывается, и переворот или наклон
 * карточки перестаёт быть объёмным. На слабых видеокартах такая смена режима
 * композиции посреди жеста выглядит как зависание анимации.
 *
 * Фильтр убирается через состояние, а не записью в style: движок анимаций
 * в конце перезаписывает инлайновые стили, и ручная правка иногда не выживала.
 */
export interface CardEntranceProps {
  index: number;
  maxDelaySeconds: number;
  duration?: number;
  blurPx: number;
  disabled?: boolean;
  children: ReactNode;
}

export default function CardEntrance({
  index,
  maxDelaySeconds,
  duration = 0.45,
  blurPx,
  disabled = false,
  children,
}: CardEntranceProps) {
  const [settled, setSettled] = useState(false);
  const blur = disabled || settled ? undefined : `blur(${blurPx}px)`;

  return (
    <motion.div
      data-card-entrance={settled ? "settled" : "animating"}
      initial={
        disabled
          ? false
          : {
              opacity: 0,
              y: 24,
              scale: 0.97,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration,
        delay: disabled ? 0 : Math.min(index * 0.04, maxDelaySeconds),
        ease: [0.16, 1, 0.3, 1],
      }}
      onAnimationComplete={() => {
        setSettled(true);
      }}
      // размытие живёт здесь, а не в animate: движок анимаций не умеет
      // записывать filter: none и оставлял бы на карточке blur(0px) навсегда
      style={{
        filter: blur,
        transition: `filter ${duration}s cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    >
      {children}
    </motion.div>
  );
}
