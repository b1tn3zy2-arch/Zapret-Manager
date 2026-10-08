const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 800,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

const BREAKPOINT_ORDER: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];

export function getBreakpoint(width: number): Breakpoint {
  let current: Breakpoint = "xs";

  for (const name of BREAKPOINT_ORDER) {
    if (width >= BREAKPOINTS[name]) {
      current = name;
    }
  }

  return current;
}

export const SIDEBAR_AUTO_COLLAPSE_BREAKPOINT: Breakpoint = "lg";

export const SIDEBAR_AUTO_EXPAND_BREAKPOINT: Breakpoint = "xl";

export const BREAKPOINT_ORDER_LIST = BREAKPOINT_ORDER;
