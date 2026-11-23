// Импортируем зависимости из модуля react.
import { useEffect, useMemo } from "react";
// Импортируем зависимости из модуля framer-motion.
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/lib/constants.
import { COUNT_UP_DURATION_MS } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AnimatedNumberProps {
  // Обрабатываем конструкцию: value.
  value: number;
  // Обрабатываем конструкцию: duration.
  duration?: number;
  // Обрабатываем конструкцию: format.
  format?: (value: number) => string;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const BASE_STIFFNESS = 220.
const BASE_STIFFNESS = 220;
// Обрабатываем конструкцию: const BASE_MASS = 0.8.
const BASE_MASS = 0.8;
// Сохраняем пояснение разработчика: // Критическое демпфирование для базовой жёсткости: число до…
// Критическое демпфирование для базовой жёсткости: число доезжает до цели
// Сохраняем пояснение разработчика: // примерно за COUNT_UP_DURATION_MS и не дрожит на конце.
// примерно за COUNT_UP_DURATION_MS и не дрожит на конце.
// Обрабатываем конструкцию: const BASE_DAMPING = 2 * Math.sqrt(BASE_STIFFNESS * BAS….
const BASE_DAMPING = 2 * Math.sqrt(BASE_STIFFNESS * BASE_MASS);
// — разделитель логических блоков —

// Объявляем функцию defaultFormat.
function defaultFormat(value: number): string {
  // Возвращаем результат: String(Math.round(value)).
  return String(Math.round(value));
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function AnimatedNumber({
  // Обрабатываем конструкцию: value.
  value,
  // Обрабатываем конструкцию: duration.
  duration = COUNT_UP_DURATION_MS,
  // Обрабатываем конструкцию: format.
  format = defaultFormat,
  // Обрабатываем конструкцию: className.
  className,
  // Закрываем текущий блок.
}: AnimatedNumberProps) {
  // Обрабатываем конструкцию: const { reduced: reducedMotion } = useMotionPreference(….
  const { reduced: reducedMotion } = useMotionPreference();
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Пружина подписывается на источник один раз, поэтому число…
  // Пружина подписывается на источник один раз, поэтому число обязано
  // Сохраняем пояснение разработчика: // приходить как MotionValue. С обычным числом useSpring бра…
  // приходить как MotionValue. С обычным числом useSpring брал стартовое
  // Сохраняем пояснение разработчика: // значение и больше не реагировал: счётчики монитора навсег…
  // значение и больше не реагировал: счётчики монитора навсегда оставались
  // Сохраняем пояснение разработчика: // нулевыми, хотя события сети приходили с реальными данными…
  // нулевыми, хотя события сети приходили с реальными данными.
  // Обрабатываем конструкцию: const source = useMotionValue(value).
  const source = useMotionValue(value);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: source.
    source.set(value);
    // Закрываем текущий блок.
  }, [source, value]);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Настройка скорости анимаций меняет жёсткость и демпфирова…
  // Настройка скорости анимаций меняет жёсткость и демпфирование, но
  // Сохраняем пояснение разработчика: // коэффициент отношения сохраняется — иначе пружина то полз…
  // коэффициент отношения сохраняется — иначе пружина то ползёт, то
  // Сохраняем пояснение разработчика: // перелетает значение. Конфигурация мемоизизирована: новая …
  // перелетает значение. Конфигурация мемоизизирована: новая на каждый рендер
  // Сохраняем пояснение разработчика: // переподписывала бы пружину и начинала анимацию заново.
  // переподписывала бы пружину и начинала анимацию заново.
  // Обрабатываем конструкцию: const springOptions = useMemo(() => { const speed = Mat….
  const springOptions = useMemo(() => {
    // Обрабатываем конструкцию: const speed = Math.max(COUNT_UP_DURATION_MS, duration) ….
    const speed =
      // Обрабатываем конструкцию: Math.
      Math.max(COUNT_UP_DURATION_MS, duration) / COUNT_UP_DURATION_MS;
    // — разделитель логических блоков —

    // Возвращаем результат: { stiffness: BASE_STIFFNESS / speed ** 2, damping: BASE….
    return {
      // Обрабатываем конструкцию: stiffness.
      stiffness: BASE_STIFFNESS / speed ** 2,
      // Обрабатываем конструкцию: damping.
      damping: BASE_DAMPING / speed,
      // Обрабатываем конструкцию: mass.
      mass: BASE_MASS,
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [duration]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const spring = useSpring(source, springOptions).
  const spring = useSpring(source, springOptions);
  // Обрабатываем конструкцию: const text = useTransform(spring, (latest) => format(la….
  const text = useTransform(spring, (latest) => format(latest));
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: reducedMotion.
  if (reducedMotion) {
    // Возвращаем результат: <span className={className}>{format(value)}</span>.
    return <span className={className}>{format(value)}</span>;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: <motion.span className={className}>{text}</motion.span>.
  return <motion.span className={className}>{text}</motion.span>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
