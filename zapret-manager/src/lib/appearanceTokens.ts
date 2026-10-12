export const INTERFACE_SCALE_MIN = 80;
export const INTERFACE_SCALE_MAX = 130;
export const INTERFACE_SCALE_STEP = 5;
export const INTERFACE_SCALE_DEFAULT = 100;

function clampInterfaceScale(value: number): number {
  const clamped = Math.min(
    Math.max(value, INTERFACE_SCALE_MIN),
    INTERFACE_SCALE_MAX
  );

  return Math.round(clamped / INTERFACE_SCALE_STEP) * INTERFACE_SCALE_STEP;
}

export function interfaceScaleToRoot(percent: number): number {
  return clampInterfaceScale(percent) / INTERFACE_SCALE_DEFAULT;
}

export const ANIMATION_SPEED_MIN = 25;
export const ANIMATION_SPEED_MAX = 300;
export const ANIMATION_SPEED_STEP = 25;

let speedFactor = 1;

export function getAnimationSpeedFactor(): number {
  return speedFactor;
}

function clampAnimationSpeed(value: number): number {
  const clamped = Math.min(
    Math.max(value, ANIMATION_SPEED_MIN),
    ANIMATION_SPEED_MAX
  );

  return Math.round(clamped / ANIMATION_SPEED_STEP) * ANIMATION_SPEED_STEP;
}

export function applyAnimationSpeed(percent: number): number {
  const clamped = clampAnimationSpeed(percent);

  speedFactor = 100 / clamped;

  return clamped;
}
