import { motion } from "framer-motion";
import { Power } from "lucide-react";

import { Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { ANIMATION } from "@/lib/constants";
import { SWITCH_STEP_LABELS } from "@/lib/vpnConstants";
import { cn } from "@/lib/utils";
import type { SwitchStep, VpnState } from "@/types";

export interface ConnectButtonProps {
  status: VpnState;
  isSwitching: boolean;
  switchStep: SwitchStep | null;
  activeServerName: string | null;
  onClick: () => void;
}

const RING_CLASSES: Record<VpnState, string> = {
  disconnected: "border-white/15",
  connecting: "border-accent-warning",
  connected: "border-accent-success bg-accent-success/10",
  disconnecting: "border-accent-warning",
  error: "border-accent-danger",
};

const PULSE_KEYFRAMES = {
  scale: [1, 1.05, 1],
};

export default function ConnectButton({
  status,
  isSwitching,
  switchStep,
  activeServerName,
  onClick,
}: ConnectButtonProps) {
  const { t } = useI18n();
  const isConnected = status === "connected";
  const isBusy = status === "connecting" || status === "disconnecting";

  const caption = isBusy
    ? switchStep !== null
      ? t(SWITCH_STEP_LABELS[switchStep])
      : t("dashboard.vpn.connecting")
    : isConnected
      ? t("dashboard.vpn.connectedTo").replace("{name}", activeServerName ?? "")
      : status === "error"
        ? t("dashboard.vpn.connectFailed")
        : t("dashboard.vpn.clickToConnect");

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        type="button"
        aria-label={
          isConnected
            ? t("dashboard.vpn.disconnectAria")
            : t("dashboard.vpn.connectAria")
        }
        aria-busy={isBusy}
        disabled={isSwitching}
        onClick={onClick}
        animate={isConnected ? PULSE_KEYFRAMES : { scale: 1 }}
        transition={
          isConnected
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
          RING_CLASSES[status]
        )}
      >
        <Power
          aria-hidden="true"
          className={cn(
            "size-16 transition-colors duration-300",
            isBusy && "animate-spin",
            isConnected ? "text-accent-success" : "text-text-secondary"
          )}
          strokeWidth={1.75}
        />
      </motion.button>

      <Text
        variant="body"
        size="sm"
        className={cn(
          "text-center",
          isConnected
            ? "text-accent-success"
            : status === "error"
              ? "text-accent-danger"
              : "text-text-secondary"
        )}
      >
        {caption}
      </Text>
    </div>
  );
}
