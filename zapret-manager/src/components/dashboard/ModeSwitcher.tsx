import { motion } from "framer-motion";
import { Lock, Zap } from "lucide-react";

import { useI18n } from "@/i18n";
import { type DashboardMode } from "@/lib/constants";
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
  const isVpn = mode === "vpn";

  const caption = isSwitching
    ? switchStep !== null
      ? t(SWITCH_STEP_LABELS[switchStep])
      : t("settings.vpn.switching")
    : isVpn
      ? t("dashboard.modeSwitcher.activeVpn")
      : t("dashboard.modeSwitcher.activeDpi");

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
        <motion.span
          aria-hidden="true"
          animate={{ x: isVpn ? "100%" : "0%" }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 32,
            mass: 0.7,
          }}
          className={cn(
            "absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full",
            isVpn ? "bg-accent-secondary" : "bg-accent-primary"
          )}
        />

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

      <p
        aria-live="polite"
        className="text-text-tertiary flex min-h-4 items-center justify-center text-center text-xs"
      >
        {caption}
      </p>
    </div>
  );
}
