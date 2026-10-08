export interface TiltAngles {
  rotateX: number;
  rotateY: number;
}

export interface GlowPosition {
  x: number;
  y: number;
}

export function computeTilt(
  mouseX: number,
  mouseY: number,
  rect: { left: number; top: number; width: number; height: number },
  maxTilt: number
): TiltAngles {
  if (rect.width === 0 || rect.height === 0) {
    return { rotateX: 0, rotateY: 0 };
  }

  const normalizedX = clamp((mouseX - rect.left) / rect.width - 0.5, -0.5, 0.5);
  const normalizedY = clamp((mouseY - rect.top) / rect.height - 0.5, -0.5, 0.5);

  return {
    rotateY: normalizedX * maxTilt * 2,
    rotateX: normalizedY * maxTilt * -2,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function computeGlowPosition(
  mouseX: number,
  mouseY: number,
  rect: { left: number; top: number; width: number; height: number }
): GlowPosition {
  if (rect.width === 0 || rect.height === 0) {
    return { x: 50, y: 50 };
  }

  return {
    x: ((mouseX - rect.left) / rect.width) * 100,
    y: ((mouseY - rect.top) / rect.height) * 100,
  };
}

export function buildGlowGradient(x: number, y: number, color: string): string {
  return `radial-gradient(360px circle at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${color}, transparent 70%)`;
}
