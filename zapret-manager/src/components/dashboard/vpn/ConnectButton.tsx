import { AnimatePresence, motion } from "framer-motion";
import { Power } from "lucide-react";

import { Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useMotionPreference } from "@/hooks/useMotionPreference";
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

export default function ConnectButton({
  connected,
  connecting,
  isSwitching,
  switchStep,
  activeServerName,
  onClick,
}: ConnectButtonProps) {
  const { t } = useI18n();
  const { reduced } = useMotionPreference();
  const isBusy = connecting || isSwitching;
  const state = connected ? "on" : "off";

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
        {...(reduced
          ? {}
          : { whileHover: { scale: 1.03 }, whileTap: { scale: 0.94 } })}
        className={cn(
          "bg-bg-secondary/60 relative flex items-center justify-center rounded-full border-2",
          "size-[clamp(160px,18vw,200px)]",
          "transition-[border-color,background-color,box-shadow] duration-300",
          "disabled:cursor-not-allowed disabled:opacity-60",
          connected
            ? "border-accent-success bg-accent-success/10 shadow-[0_0_48px_rgb(var(--color-accent-success-rgb)/0.28)]"
            : isBusy
              ? "border-accent-warning shadow-[0_0_32px_rgb(var(--color-accent-warning-rgb)/0.25)]"
              : "border-glass-border hover:border-accent-primary/60"
        )}
      >
        <AnimatePresence>
          <motion.span
            key={state}
            aria-hidden="true"
            initial={reduced ? false : { scale: 0.85, opacity: 0.75 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.65, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full border-2",
              connected ? "border-accent-success" : "border-glass-border"
            )}
          />

          {connected ? (
            <motion.span
              key={`${state}-halo`}
              aria-hidden="true"
              initial={reduced ? false : { opacity: 0.45 }}
              animate={{ opacity: [0.45, 0.9, 0.45] }}
              transition={{
                duration: reduced ? 0 : 2.6,
                repeat: reduced ? 0 : Infinity,
                ease: "easeInOut",
              }}
              className="border-accent-success/40 pointer-events-none absolute -inset-1 rounded-full border"
            />
          ) : null}
        </AnimatePresence>

        <motion.span
          animate={
            reduced || !connected
              ? { scale: 1 }
              : {
                  scale: [1, 1.08, 1],
                  transition: { duration: 2.6, repeat: Infinity },
                }
          }
          className="flex items-center justify-center"
        >
          <motion.span
            className="flex items-center justify-center"
            {...(reduced
              ? {}
              : {
                  animate: isBusy
                    ? { rotate: 360 }
                    : connected
                      ? { rotate: [0, 360] }
                      : { rotate: 0 },
                  transition: isBusy
                    ? {
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "linear" as const,
                      }
                    : {
                        duration: 24,
                        repeat: Infinity,
                        ease: "linear" as const,
                      },
                })}
          >
            <Power
              aria-hidden="true"
              className={cn(
                "size-16 transition-colors duration-300",
                connected ? "text-accent-success" : "text-text-secondary"
              )}
              strokeWidth={1.75}
            />
          </motion.span>
        </motion.span>
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
