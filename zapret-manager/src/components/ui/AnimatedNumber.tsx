import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { useMotionPreference } from "@/hooks/useMotionPreference";
import { COUNT_UP_DURATION_MS } from "@/lib/constants";

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

const BASE_STIFFNESS = 220;
const BASE_MASS = 0.8;
// Критическое демпфирование для базовой жёсткости: число доезжает до цели
// примерно за COUNT_UP_DURATION_MS и не дрожит на конце.
const BASE_DAMPING = 2 * Math.sqrt(BASE_STIFFNESS * BASE_MASS);

function defaultFormat(value: number): string {
  return String(Math.round(value));
}

export default function AnimatedNumber({
  value,
  duration = COUNT_UP_DURATION_MS,
  format = defaultFormat,
  className,
}: AnimatedNumberProps) {
  const { reduced: reducedMotion } = useMotionPreference();

  // Пружина подписывается на источник один раз, поэтому число обязано
  // приходить как MotionValue. С обычным числом useSpring брал стартовое
  // значение и больше не реагировал: счётчики монитора навсегда оставались
  // нулевыми, хотя события сети приходили с реальными данными.
  const source = useMotionValue(value);

  useEffect(() => {
    source.set(value);
  }, [source, value]);

  // Настройка скорости анимаций меняет жёсткость и демпфирование, но
  // коэффициент отношения сохраняется — иначе пружина то ползёт, то
  // перелетает значение. Конфигурация мемоизизирована: новая на каждый рендер
  // переподписывала бы пружину и начинала анимацию заново.
  const springOptions = useMemo(() => {
    const speed =
      Math.max(COUNT_UP_DURATION_MS, duration) / COUNT_UP_DURATION_MS;

    return {
      stiffness: BASE_STIFFNESS / speed ** 2,
      damping: BASE_DAMPING / speed,
      mass: BASE_MASS,
    };
  }, [duration]);

  const spring = useSpring(source, springOptions);
  const text = useTransform(spring, (latest) => format(latest));

  if (reducedMotion) {
    return <span className={className}>{format(value)}</span>;
  }

  return <motion.span className={className}>{text}</motion.span>;
}
