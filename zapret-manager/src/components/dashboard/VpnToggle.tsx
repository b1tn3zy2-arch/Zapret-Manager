import { motion } from "framer-motion";
import { Loader2, Lock, Zap } from "lucide-react";

import { useI18n } from "@/i18n";
import { ANIMATION } from "@/lib/constants";
import { SWITCH_STEP_LABELS } from "@/lib/vpnConstants";
import { cn } from "@/lib/utils";
import type { SwitchStep } from "@/types";

export interface VpnToggleProps {
  isVpn: boolean;
  switchStep: SwitchStep | null;
  isSwitching: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function VpnToggle({
  isVpn,
  switchStep,
  isSwitching,
  disabled = false,
  onChange,
}: VpnToggleProps) {
  const { t } = useI18n();
  const caption = isSwitching
    ? switchStep !== null
      ? t(SWITCH_STEP_LABELS[switchStep])
      : t("settings.vpn.switching")
    : isVpn
      ? t("settings.vpn.toggleVpnActive")
      : t("settings.vpn.toggleDpiActive");

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={isVpn}
        aria-label={t("settings.vpn.toggleAriaLabel")}
        disabled={disabled || isSwitching}
        onClick={() => {
          onChange(!isVpn);
        }}
        className={cn(
          "relative flex h-14 w-full items-center border-white/10 bg-white/5",
          "rounded-full border px-2 transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <motion.span
          aria-hidden="true"
          className={cn(
            "absolute top-1.5 bottom-1.5 w-12 rounded-full",
            isVpn ? "bg-accent-secondary" : "bg-accent-primary"
          )}
          style={{
            boxShadow: isVpn
              ? "0 0 16px rgba(0, 212, 255, 0.35)"
              : "0 0 16px rgba(0, 255, 136, 0.35)",
          }}
          animate={{ left: isVpn ? "calc(100% - 52px)" : "4px" }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 32,
            duration: ANIMATION.fast,
          }}
        />

        <span
          className={cn(
            "relative z-10 flex w-12 items-center justify-center",
            isVpn ? "text-text-tertiary" : "text-bg-primary"
          )}
        >
          <Zap aria-hidden="true" className="size-5" strokeWidth={2.5} />
        </span>

        <span className="flex-1 text-center">
          <span
            className={cn(
              "text-xs font-medium tracking-wide",
              isVpn ? "text-text-tertiary" : "text-text-primary"
            )}
          >
            DPI
          </span>
        </span>

        <span
          className={cn(
            "relative z-10 flex w-12 items-center justify-center",
            isVpn ? "text-bg-primary" : "text-text-tertiary"
          )}
        >
          <Lock aria-hidden="true" className="size-5" strokeWidth={2.5} />
        </span>
      </button>

      <p className="text-text-tertiary flex min-h-4 items-center justify-center gap-1.5 text-center text-xs">
        {isSwitching ? (
          <Loader2
            aria-hidden="true"
            className="size-3 animate-spin"
            strokeWidth={2}
          />
        ) : null}
        {caption}
      </p>
    </div>
  );
}

export default VpnToggle;
