import { useCallback, useEffect, useState } from "react";

import {
  BREAKPOINT_ORDER_LIST,
  SIDEBAR_AUTO_COLLAPSE_BREAKPOINT,
  SIDEBAR_AUTO_EXPAND_BREAKPOINT,
  type Breakpoint,
} from "@/lib/breakpoints";
import { useViewport } from "@/hooks/useViewport";
import {
  selectSidebarCollapsed,
  selectSetSidebarCollapsed,
  selectToggleSidebar,
  useAppStore,
} from "@/stores/useAppStore";

export interface AdaptiveSidebar {
  isCollapsed: boolean;
  breakpoint: Breakpoint;
  toggle: () => void;
  isAutoManaged: boolean;
}

function rank(breakpoint: Breakpoint): number {
  return BREAKPOINT_ORDER_LIST.indexOf(breakpoint);
}

export function useAdaptiveSidebar(): AdaptiveSidebar {
  const { breakpoint } = useViewport();
  const collapsed = useAppStore(selectSidebarCollapsed);
  const toggleSidebar = useAppStore(selectToggleSidebar);
  const setCollapsed = useAppStore(selectSetSidebarCollapsed);
  const [overrideBreakpoint, setOverrideBreakpoint] =
    useState<Breakpoint | null>(null);

  useEffect(() => {
    if (overrideBreakpoint === breakpoint) {
      return;
    }

    const shouldCollapse =
      rank(breakpoint) < rank(SIDEBAR_AUTO_COLLAPSE_BREAKPOINT);
    const shouldExpand =
      rank(breakpoint) >= rank(SIDEBAR_AUTO_EXPAND_BREAKPOINT);

    if (shouldCollapse && !collapsed) {
      setCollapsed(true);
    } else if (shouldExpand && collapsed) {
      setCollapsed(false);
    }
  }, [breakpoint, collapsed, setCollapsed, overrideBreakpoint]);

  const toggle = useCallback(() => {
    setOverrideBreakpoint(breakpoint);
    toggleSidebar();
  }, [breakpoint, toggleSidebar]);

  return {
    isCollapsed: collapsed,
    breakpoint,
    toggle,
    isAutoManaged: overrideBreakpoint !== breakpoint,
  };
}
