import { AnimatePresence, motion } from "framer-motion";
import { Lock, Zap } from "lucide-react";

import { useI18n } from "@/i18n";
import { usePrefersReducedMotion } from "@/hooks/useDeviceTier";
import {
  ANIMATION,
  MODE_SWITCH_THUMB_MS,
  type DashboardMode,
} from "@/lib/constants";
import { SWITCH_STEP_LABELS } from "@/lib/vpnConstants";
import { cn } from "@/lib/utils";
import type { SwitchStep } from "@/types";

export interface ModeSwitcherProps {
  mode: DashboardMode;
  switchStep: SwitchStep | null;
  isSwitching: boolean;
  disabled?: boolean;
  onChange: (mode: DashboardMode) => void;
}

export default function ModeSwitcher({
  mode,
  switchStep,
  isSwitching,
  disabled = false,
  onChange,
}: ModeSwitcherProps) {
  const { t } = useI18n();
  const reducedMotion = usePrefersReducedMotion();
  const isVpn = mode === "vpn";

  const caption = isSwitching
    ? switchStep !== null
      ? t(SWITCH_STEP_LABELS[switchStep])
      : t("settings.vpn.switching")
    : isVpn
      ? t("dashboard.modeSwitcher.activeVpn")
      : t("dashboard.modeSwitcher.activeDpi");

  const thumbTransition = reducedMotion
    ? { duration: 0 }
    : {
        duration: MODE_SWITCH_THUMB_MS / 1000,
        ease: ANIMATION.easeOutExpo,
      };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="radiogroup"
        aria-label={t("dashboard.modeSwitcher.ariaLabel")}
        className={cn(
          "border-glass-border bg-glass-bg relative flex h-12 items-center",
          "w-[clamp(200px,20vw,280px)] rounded-full border p-1"
        )}
      >
        {isVpn ? (
          <motion.span
            key="vpn-thumb"
            aria-hidden="true"
            layoutId="mode-thumb"
            transition={thumbTransition}
            className="bg-accent-secondary absolute top-1 right-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-[0_0_16px_rgb(var(--color-accent-secondary-rgb)/0.4)]"
          />
        ) : (
          <motion.span
            key="dpi-thumb"
            aria-hidden="true"
            layoutId="mode-thumb"
            transition={thumbTransition}
            className="bg-accent-primary absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full shadow-[0_0_16px_rgb(var(--color-accent-primary-rgb)/0.4)]"
          />
        )}

        {(["dpi", "vpn"] as const).map((value) => {
          const active = value === mode;
          const Icon = value === "vpn" ? Lock : Zap;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t(
                value === "vpn"
                  ? "dashboard.modeSwitcher.switchToVpn"
                  : "dashboard.modeSwitcher.switchToDpi"
              )}
              disabled={disabled || isSwitching}
              onClick={() => {
                onChange(value);
              }}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-1.5",
                "rounded-full text-xs font-medium transition-colors",
                "duration-200 disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "text-on-accent"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <Icon
                aria-hidden="true"
                className="size-4 shrink-0"
                strokeWidth={2.5}
              />
              <span>
                {t(
                  value === "vpn"
                    ? "dashboard.modeSwitcher.vpn"
                    : "dashboard.modeSwitcher.dpi"
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative flex min-h-4 items-center justify-center">
        <AnimatePresence initial={false}>
          <motion.p
            key={caption}
            aria-live="polite"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reducedMotion ? 0 : ANIMATION.fast }}
            className="text-text-tertiary absolute text-center text-xs"
          >
            {caption}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
