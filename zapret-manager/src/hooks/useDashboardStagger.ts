import { useMemo } from "react";
import type { Variants } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/useDeviceTier";
import {
  ANIMATION,
  DASHBOARD_ITEM_DURATION_MS,
  DASHBOARD_STAGGER_MS,
} from "@/lib/constants";

export interface DashboardStaggerVariants {
  containerVariants: Variants;
  itemVariants: Variants;
}

export function useDashboardStagger(): DashboardStaggerVariants {
  const reducedMotion = usePrefersReducedMotion();

  return useMemo(() => {
    if (reducedMotion) {
      const staticVariants: Variants = {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { duration: 0 } },
      };

      return {
        containerVariants: staticVariants,
        itemVariants: staticVariants,
      };
    }

    const containerVariants: Variants = {
      hidden: {},
      visible: {
        transition: { staggerChildren: DASHBOARD_STAGGER_MS / 1000 },
      },
    };

    const itemVariants: Variants = {
      hidden: { opacity: 0, y: 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: DASHBOARD_ITEM_DURATION_MS / 1000,
          ease: ANIMATION.easeOutExpo,
        },
      },
    };

    return { containerVariants, itemVariants };
  }, [reducedMotion]);
}
