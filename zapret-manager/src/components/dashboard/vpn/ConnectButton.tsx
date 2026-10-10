import { motion } from "framer-motion";
import { Power } from "lucide-react";

import { Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { ANIMATION } from "@/lib/constants";
import { SWITCH_STEP_LABELS } from "@/lib/vpnConstants";
import { cn } from "@/lib/utils";
import type { SwitchStep } from "@/types";

export interface ConnectButtonProps {
  connected: boolean;
  connecting: boolean;
  isSwitching: boolean;
  switchStep: SwitchStep | null;
  activeServerName: string | null;
  onClick: () => void;
}

const PULSE_KEYFRAMES = {
  scale: [1, 1.05, 1],
};

export default function ConnectButton({
  connected,
  connecting,
  isSwitching,
  switchStep,
  activeServerName,
  onClick,
}: ConnectButtonProps) {
  const { t } = useI18n();
  const isBusy = connecting;

  const caption = isBusy
    ? switchStep !== null
      ? t(SWITCH_STEP_LABELS[switchStep])
      : t("dashboard.vpn.connecting")
    : connected
      ? t("dashboard.vpn.connectedTo").replace("{name}", activeServerName ?? "")
      : t("dashboard.vpn.clickToConnect");

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        type="button"
        aria-label={
          connected
            ? t("dashboard.vpn.disconnectAria")
            : t("dashboard.vpn.connectAria")
        }
        aria-busy={isBusy}
        disabled={isSwitching}
        onClick={onClick}
        animate={connected ? PULSE_KEYFRAMES : { scale: 1 }}
        transition={
          connected
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : { duration: ANIMATION.normal }
        }
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "bg-bg-secondary/60 flex items-center justify-center rounded-full border-2",
          "size-[clamp(160px,18vw,200px)] transition-colors",
          "hover:border-accent-primary/60 duration-300",
          "disabled:cursor-not-allowed disabled:opacity-60",
          connected
            ? "border-accent-success bg-accent-success/10"
            : isBusy
              ? "border-accent-warning"
              : "border-white/15"
        )}
      >
        <Power
          aria-hidden="true"
          className={cn(
            "size-16 transition-colors duration-300",
            isBusy && "animate-spin",
            connected ? "text-accent-success" : "text-text-secondary"
          )}
          strokeWidth={1.75}
        />
      </motion.button>

      <Text
        variant="body"
        size="sm"
        className={cn(
          "text-center",
          connected ? "text-accent-success" : "text-text-secondary"
        )}
      >
        {caption}
      </Text>
    </div>
  );
}
