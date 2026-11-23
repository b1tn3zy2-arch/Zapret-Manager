// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, type MouseEvent } from "react";
// Импортируем зависимости из модуля framer-motion.
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { CARD_TILT_SPRING } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/cardTilt.
import {
  // Подключаем именованный импорт buildGlowGradient.
  buildGlowGradient,
  // Подключаем именованный импорт computeGlowPosition.
  computeGlowPosition,
  // Подключаем именованный импорт computeTilt.
  computeTilt,
  // Закрываем текущий блок.
} from "@/lib/cardTilt";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseCardTiltOptions {
  // Обрабатываем конструкцию: maxTilt.
  maxTilt?: number;
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Обрабатываем конструкцию: glowColor.
  glowColor?: string;
  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Карточка перевёрнута на 180°, поэтому наклон «в сторону ку…
   * Карточка перевёрнута на 180°, поэтому наклон «в сторону курсора» на вид
   // Сохраняем пояснение разработчика: * оказывается зеркальным. На перевороте направления меняются…
   * оказывается зеркальным. На перевороте направления меняются местами.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: inverted.
  inverted?: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseCardTiltResult {
  // Обрабатываем конструкцию: containerRef.
  containerRef: React.RefObject<HTMLDivElement | null>;
  // Обрабатываем конструкцию: handleMouseMove.
  handleMouseMove: (event: MouseEvent<HTMLDivElement>) => void;
  // Обрабатываем конструкцию: handleMouseLeave.
  handleMouseLeave: () => void;
  // Обрабатываем конструкцию: rotateX.
  rotateX: MotionValue<number>;
  // Обрабатываем конструкцию: rotateY.
  rotateY: MotionValue<number>;
  // Обрабатываем конструкцию: glow.
  glow: MotionValue<string>;
  // Обрабатываем конструкцию: isInteractive.
  isInteractive: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс PointerPoint с контрактом данных.
interface PointerPoint {
  // Обрабатываем конструкцию: x.
  x: number;
  // Обрабатываем конструкцию: y.
  y: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useCardTilt(
  // Обрабатываем конструкцию: options.
  options: UseCardTiltOptions = {}
  // Закрываем выражение или список аргументов.
): UseCardTiltResult {
  // Обрабатываем конструкцию: const { maxTilt = 10, disabled = false, glowColor = rgb….
  const {
    // Обрабатываем конструкцию: maxTilt.
    maxTilt = 10,
    // Обрабатываем конструкцию: disabled.
    disabled = false,
    // Обрабатываем конструкцию: glowColor.
    glowColor = "rgba(255, 255, 255, 0.06)",
    // Обрабатываем конструкцию: inverted.
    inverted = false,
    // Закрываем текущий блок.
  } = options;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const containerRef = useRef<HTMLDivElement>(null).
  const containerRef = useRef<HTMLDivElement>(null);
  // Обрабатываем конструкцию: const pendingPoint = useRef<PointerPoint | null>(null).
  const pendingPoint = useRef<PointerPoint | null>(null);
  // Обрабатываем конструкцию: const frameRef = useRef<number | null>(null).
  const frameRef = useRef<number | null>(null);
  // Обрабатываем конструкцию: const rawRotateX = useMotionValue(0).
  const rawRotateX = useMotionValue(0);
  // Обрабатываем конструкцию: const rawRotateY = useMotionValue(0).
  const rawRotateY = useMotionValue(0);
  // Обрабатываем конструкцию: const rawGlow = useMotionValue(buildGlowGradient(50, 50….
  const rawGlow = useMotionValue(buildGlowGradient(50, 50, glowColor));
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const rotateX = useSpring(rawRotateX, CARD_TILT_SPRING).
  const rotateX = useSpring(rawRotateX, CARD_TILT_SPRING);
  // Обрабатываем конструкцию: const rotateY = useSpring(rawRotateY, CARD_TILT_SPRING).
  const rotateY = useSpring(rawRotateY, CARD_TILT_SPRING);
  // Обрабатываем конструкцию: const glow = useSpring(rawGlow, { stiffness: 320, dampi….
  const glow = useSpring(rawGlow, { stiffness: 320, damping: 30 });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const reset = useCallback(() => { rawRotateX.set(0); ra….
  const reset = useCallback(() => {
    // Обрабатываем конструкцию: rawRotateX.
    rawRotateX.set(0);
    // Обрабатываем конструкцию: rawRotateY.
    rawRotateY.set(0);
    // Обрабатываем конструкцию: rawGlow.
    rawGlow.set(buildGlowGradient(50, 50, glowColor));
    // Закрываем текущий блок.
  }, [glowColor, rawGlow, rawRotateX, rawRotateY]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const applyPendingPoint = useCallback(() => { frameRef.….
  const applyPendingPoint = useCallback(() => {
    // Обрабатываем конструкцию: frameRef.
    frameRef.current = null;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const point = pendingPoint.current.
    const point = pendingPoint.current;
    // Обрабатываем конструкцию: const element = containerRef.current.
    const element = containerRef.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: point === null || element === null.
    if (point === null || element === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const rect = element.getBoundingClientRect().
    const rect = element.getBoundingClientRect();
    // Обрабатываем конструкцию: const tilt = computeTilt(point.x, point.y, rect, maxTil….
    const tilt = computeTilt(point.x, point.y, rect, maxTilt);
    // Обрабатываем конструкцию: const position = computeGlowPosition(point.x, point.y, ….
    const position = computeGlowPosition(point.x, point.y, rect);
    // Обрабатываем конструкцию: const direction = inverted ? -1 : 1.
    const direction = inverted ? -1 : 1;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: rawRotateX.
    rawRotateX.set(tilt.rotateX * direction);
    // Обрабатываем конструкцию: rawRotateY.
    rawRotateY.set(tilt.rotateY * direction);
    // Обрабатываем конструкцию: rawGlow.
    rawGlow.set(buildGlowGradient(position.x, position.y, glowColor));
    // Закрываем текущий блок.
  }, [glowColor, inverted, maxTilt, rawGlow, rawRotateX, rawRotateY]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleMouseMove = useCallback( (event: MouseEvent….
  const handleMouseMove = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (event: MouseEvent<HTMLDivElement>): void => {
      // Проверяем бизнес-условие: disabled.
      if (disabled) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: pendingPoint.
      pendingPoint.current = { x: event.clientX, y: event.clientY };
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: frameRef.current !== null.
      if (frameRef.current !== null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: frameRef.
      frameRef.current = window.requestAnimationFrame(applyPendingPoint);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [applyPendingPoint, disabled]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleMouseLeave = useCallback(() => { pendingPoi….
  const handleMouseLeave = useCallback(() => {
    // Обрабатываем конструкцию: pendingPoint.
    pendingPoint.current = null;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: frameRef.current !== null.
    if (frameRef.current !== null) {
      // Обрабатываем конструкцию: window.
      window.cancelAnimationFrame(frameRef.current);
      // Обрабатываем конструкцию: frameRef.
      frameRef.current = null;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: reset.
    reset();
    // Закрываем текущий блок.
  }, [reset]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () => () => {
      // Проверяем бизнес-условие: frameRef.current !== null.
      if (frameRef.current !== null) {
        // Обрабатываем конструкцию: window.
        window.cancelAnimationFrame(frameRef.current);
        // Обрабатываем конструкцию: frameRef.
        frameRef.current = null;
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    []
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { containerRef, handleMouseMove, handleMouseLeave, rota….
  return {
    // Передаём поле containerRef в объект.
    containerRef,
    // Передаём поле handleMouseMove в объект.
    handleMouseMove,
    // Передаём поле handleMouseLeave в объект.
    handleMouseLeave,
    // Передаём поле rotateX в объект.
    rotateX,
    // Передаём поле rotateY в объект.
    rotateY,
    // Передаём поле glow в объект.
    glow,
    // Обрабатываем конструкцию: isInteractive.
    isInteractive: !disabled,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
