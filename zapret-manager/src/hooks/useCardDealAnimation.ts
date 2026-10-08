import { useMemo } from "react";
import type { Variants } from "framer-motion";

import {
  BLOOM_DEFAULT_INTENSITY,
  CARD_DEAL_DURATION_MS,
  CARD_DEAL_STAGGER_MS,
} from "@/lib/constants";
import { usePostProcessing } from "@/contexts/postProcessing";
import { MOTION_BLUR_MAX_PX } from "@/lib/postProcessingTokens";
import type { EffectIntensity } from "@/types/appearance";

export interface CardDealVariants {
  containerVariants: Variants;
  cardVariants: Variants;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function blurOf(intensity: EffectIntensity): string {
  return `blur(${MOTION_BLUR_MAX_PX[intensity]}px)`;
}

export function useCardDealAnimation(disabled = false): CardDealVariants {
  const { motionBlur, bloom } = usePostProcessing();
  const blurIntensity: EffectIntensity =
    bloom === "off" ? BLOOM_DEFAULT_INTENSITY : bloom;

  return useMemo(() => {
    if (disabled) {
      const staticVariants: Variants = {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { duration: 0 } },
        exit: { opacity: 1, transition: { duration: 0 } },
      };

      return {
        containerVariants: staticVariants,
        cardVariants: staticVariants,
      };
    }

    const withBlur = motionBlur;
    const duration = CARD_DEAL_DURATION_MS / 1000;

    const containerVariants: Variants = {
      hidden: {},
      visible: {
        transition: { staggerChildren: CARD_DEAL_STAGGER_MS / 1000 },
      },
    };

    const cardVariants: Variants = {
      hidden: {
        opacity: 0,
        y: 30,
        rotateY: -15,
        ...(withBlur ? { filter: blurOf(blurIntensity) } : {}),
      },
      visible: {
        opacity: 1,
        y: 0,
        rotateY: 0,
        ...(withBlur ? { filter: "blur(0px)" } : {}),
        transition: { duration, ease: EASE_OUT_EXPO },
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 },
      },
    };

    return { containerVariants, cardVariants };
  }, [disabled, motionBlur, blurIntensity]);
}
