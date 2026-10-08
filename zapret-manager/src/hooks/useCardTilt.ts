import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

import { CARD_TILT_SPRING } from "@/lib/constants";
import {
  buildGlowGradient,
  computeGlowPosition,
  computeTilt,
} from "@/lib/cardTilt";

export interface UseCardTiltOptions {
  maxTilt?: number;
  disabled?: boolean;
  glowColor?: string;
}

export interface UseCardTiltResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleMouseMove: (event: MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave: () => void;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  glow: MotionValue<string>;
  isInteractive: boolean;
}

interface PointerPoint {
  x: number;
  y: number;
}

export function useCardTilt(
  options: UseCardTiltOptions = {}
): UseCardTiltResult {
  const {
    maxTilt = 10,
    disabled = false,
    glowColor = "rgba(255, 255, 255, 0.06)",
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const pendingPoint = useRef<PointerPoint | null>(null);
  const frameRef = useRef<number | null>(null);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawGlow = useMotionValue(buildGlowGradient(50, 50, glowColor));

  const rotateX = useSpring(rawRotateX, CARD_TILT_SPRING);
  const rotateY = useSpring(rawRotateY, CARD_TILT_SPRING);
  const glow = useSpring(rawGlow, { stiffness: 320, damping: 30 });

  const reset = useCallback(() => {
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawGlow.set(buildGlowGradient(50, 50, glowColor));
  }, [glowColor, rawGlow, rawRotateX, rawRotateY]);

  const applyPendingPoint = useCallback(() => {
    frameRef.current = null;

    const point = pendingPoint.current;
    const element = containerRef.current;

    if (point === null || element === null) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const tilt = computeTilt(point.x, point.y, rect, maxTilt);
    const position = computeGlowPosition(point.x, point.y, rect);

    rawRotateX.set(tilt.rotateX);
    rawRotateY.set(tilt.rotateY);
    rawGlow.set(buildGlowGradient(position.x, position.y, glowColor));
  }, [glowColor, maxTilt, rawGlow, rawRotateX, rawRotateY]);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      if (disabled) {
        return;
      }

      pendingPoint.current = { x: event.clientX, y: event.clientY };

      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(applyPendingPoint);
    },
    [applyPendingPoint, disabled]
  );

  const handleMouseLeave = useCallback(() => {
    pendingPoint.current = null;

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    reset();
  }, [reset]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    },
    []
  );

  return {
    containerRef,
    handleMouseMove,
    handleMouseLeave,
    rotateX,
    rotateY,
    glow,
    isInteractive: !disabled,
  };
}
