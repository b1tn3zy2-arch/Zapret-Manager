// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/breakpoints.
import {
  // Подключаем именованный импорт BREAKPOINT_ORDER_LIST.
  BREAKPOINT_ORDER_LIST,
  // Подключаем именованный импорт SIDEBAR_AUTO_COLLAPSE_BREAKPOINT.
  SIDEBAR_AUTO_COLLAPSE_BREAKPOINT,
  // Подключаем именованный импорт SIDEBAR_AUTO_EXPAND_BREAKPOINT.
  SIDEBAR_AUTO_EXPAND_BREAKPOINT,
  // Подключаем именованный импорт type Breakpoint.
  type Breakpoint,
  // Закрываем текущий блок.
} from "@/lib/breakpoints";
// Импортируем зависимости из модуля @/hooks/useViewport.
import { useViewport } from "@/hooks/useViewport";
// Импортируем зависимости из модуля @/stores/useAppStore.
import {
  // Подключаем именованный импорт selectSidebarCollapsed.
  selectSidebarCollapsed,
  // Подключаем именованный импорт selectSetSidebarCollapsed.
  selectSetSidebarCollapsed,
  // Подключаем именованный импорт selectToggleSidebar.
  selectToggleSidebar,
  // Подключаем именованный импорт useAppStore.
  useAppStore,
  // Закрываем текущий блок.
} from "@/stores/useAppStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AdaptiveSidebar {
  // Обрабатываем конструкцию: isCollapsed.
  isCollapsed: boolean;
  // Обрабатываем конструкцию: breakpoint.
  breakpoint: Breakpoint;
  // Обрабатываем конструкцию: toggle.
  toggle: () => void;
  // Обрабатываем конструкцию: isAutoManaged.
  isAutoManaged: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию rank.
function rank(breakpoint: Breakpoint): number {
  // Возвращаем результат: BREAKPOINT_ORDER_LIST.indexOf(breakpoint).
  return BREAKPOINT_ORDER_LIST.indexOf(breakpoint);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useAdaptiveSidebar(): AdaptiveSidebar {
  // Обрабатываем конструкцию: const { breakpoint } = useViewport().
  const { breakpoint } = useViewport();
  // Обрабатываем конструкцию: const collapsed = useAppStore(selectSidebarCollapsed).
  const collapsed = useAppStore(selectSidebarCollapsed);
  // Обрабатываем конструкцию: const toggleSidebar = useAppStore(selectToggleSidebar).
  const toggleSidebar = useAppStore(selectToggleSidebar);
  // Обрабатываем конструкцию: const setCollapsed = useAppStore(selectSetSidebarCollap….
  const setCollapsed = useAppStore(selectSetSidebarCollapsed);
  // Обрабатываем конструкцию: const [overrideBreakpoint, setOverrideBreakpoint] = use….
  const [overrideBreakpoint, setOverrideBreakpoint] =
    // Обрабатываем конструкцию: useState.
    useState<Breakpoint | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: overrideBreakpoint === breakpoint.
    if (overrideBreakpoint === breakpoint) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const shouldCollapse = rank(breakpoint) < rank(SIDEBAR_….
    const shouldCollapse =
      // Обрабатываем конструкцию: rank.
      rank(breakpoint) < rank(SIDEBAR_AUTO_COLLAPSE_BREAKPOINT);
    // Обрабатываем конструкцию: const shouldExpand = rank(breakpoint) >= rank(SIDEBAR_A….
    const shouldExpand =
      // Обрабатываем конструкцию: rank.
      rank(breakpoint) >= rank(SIDEBAR_AUTO_EXPAND_BREAKPOINT);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: shouldCollapse && !collapsed.
    if (shouldCollapse && !collapsed) {
      // Обрабатываем конструкцию: setCollapsed.
      setCollapsed(true);
      // Закрываем текущий блок.
    } else if (shouldExpand && collapsed) {
      // Обрабатываем конструкцию: setCollapsed.
      setCollapsed(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [breakpoint, collapsed, setCollapsed, overrideBreakpoint]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const toggle = useCallback(() => { setOverrideBreakpoin….
  const toggle = useCallback(() => {
    // Обрабатываем конструкцию: setOverrideBreakpoint.
    setOverrideBreakpoint(breakpoint);
    // Обрабатываем конструкцию: toggleSidebar.
    toggleSidebar();
    // Закрываем текущий блок.
  }, [breakpoint, toggleSidebar]);
  // — разделитель логических блоков —

  // Возвращаем результат: { isCollapsed: collapsed, breakpoint, toggle, isAutoMan….
  return {
    // Обрабатываем конструкцию: isCollapsed.
    isCollapsed: collapsed,
    // Передаём поле breakpoint в объект.
    breakpoint,
    // Передаём поле toggle в объект.
    toggle,
    // Обрабатываем конструкцию: isAutoManaged.
    isAutoManaged: overrideBreakpoint !== breakpoint,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
