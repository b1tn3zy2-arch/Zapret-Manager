import { useSpring, useTransform, motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/useDeviceTier";
import { COUNT_UP_DURATION_MS } from "@/lib/constants";

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

function defaultFormat(value: number): string {
  return String(Math.round(value));
}

export default function AnimatedNumber({
  value,
  duration = COUNT_UP_DURATION_MS,
  format = defaultFormat,
  className,
}: AnimatedNumberProps) {
  const reducedMotion = usePrefersReducedMotion();
  const spring = useSpring(value, {
    duration: duration / 1000,
    bounce: 0,
    skipInitialAnimation: true,
  });
  const text = useTransform(spring, (latest) => format(latest));

  if (reducedMotion) {
    return <span className={className}>{format(value)}</span>;
  }

  return <motion.span className={className}>{text}</motion.span>;
}
