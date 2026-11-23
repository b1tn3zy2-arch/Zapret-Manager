// Обрабатываем конструкцию: const BREAKPOINTS = { xs: 0, sm: 640, md: 800, lg: 1024….
const BREAKPOINTS = {
  // Обрабатываем конструкцию: xs.
  xs: 0,
  // Обрабатываем конструкцию: sm.
  sm: 640,
  // Обрабатываем конструкцию: md.
  md: 800,
  // Обрабатываем конструкцию: lg.
  lg: 1024,
  // Обрабатываем конструкцию: xl.
  xl: 1280,
  // Обрабатываем конструкцию: 2xl.
  "2xl": 1536,
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type Breakpoint = keyof typeof BREAKPOINTS;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const BREAKPOINT_ORDER: Breakpoint[] = [xs, sm, md, lg,….
const BREAKPOINT_ORDER: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function getBreakpoint(width: number): Breakpoint {
  // Обрабатываем конструкцию: let current: Breakpoint = xs.
  let current: Breakpoint = "xs";
  // — разделитель логических блоков —

  // Перебираем элементы коллекции BREAKPOINT_ORDER.
  for (const name of BREAKPOINT_ORDER) {
    // Проверяем бизнес-условие: width >= BREAKPOINTS[name].
    if (width >= BREAKPOINTS[name]) {
      // Обрабатываем конструкцию: current.
      current = name;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: current.
  return current;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SIDEBAR_AUTO_COLLAPSE_BREAKPOINT: Breakpoint = "lg";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SIDEBAR_AUTO_EXPAND_BREAKPOINT: Breakpoint = "xl";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const BREAKPOINT_ORDER_LIST = BREAKPOINT_ORDER;
// — разделитель логических блоков —
