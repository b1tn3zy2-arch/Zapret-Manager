import { motion } from "framer-motion";
import { Lock, ShieldCheck, TriangleAlert, WifiOff } from "lucide-react";

import { useBloom } from "@/hooks/useBloom";
import { useI18n } from "@/i18n";
import { CONNECTION_LABELS } from "@/lib/constants";
import type { ConnectionStatus } from "@/lib/constants";
import { ANIMATION } from "@/lib/constants";
import type { BloomColor, EffectIntensity } from "@/types/appearance";

const PALETTE = {
  connected: {
    ring: "rgba(0, 255, 136, 0.45)",
    core: "rgba(0, 255, 136, 0.18)",
    text: "text-accent-primary",
    Icon: ShieldCheck,
  },
  connecting: {
    ring: "rgba(251, 191, 36, 0.45)",
    core: "rgba(251, 191, 36, 0.16)",
    text: "text-accent-warning",
    Icon: ShieldCheck,
  },
  disconnected: {
    ring: "rgba(255, 255, 255, 0.14)",
    core: "rgba(255, 255, 255, 0.05)",
    text: "text-text-tertiary",
    Icon: WifiOff,
  },
  vpn: {
    ring: "rgba(0, 212, 255, 0.45)",
    core: "rgba(0, 212, 255, 0.18)",
    text: "text-accent-secondary",
    Icon: Lock,
  },
  error: {
    ring: "rgba(255, 82, 82, 0.45)",
    core: "rgba(255, 82, 82, 0.16)",
    text: "text-accent-danger",
    Icon: TriangleAlert,
  },
} as const satisfies Record<
  ConnectionStatus,
  { ring: string; core: string; text: string; Icon: typeof Lock }
>;

const ACTIVE_STATUSES: ConnectionStatus[] = ["connected", "connecting", "vpn"];

const BLOOM_BY_STATUS = {
  connected: {
    color: "primary" as BloomColor,
    intensity: "strong" as EffectIntensity,
  },
  connecting: {
    color: "warning" as BloomColor,
    intensity: "normal" as EffectIntensity,
  },
  disconnected: {
    color: "neutral" as BloomColor,
    intensity: "subtle" as EffectIntensity,
  },
  vpn: {
    color: "secondary" as BloomColor,
    intensity: "strong" as EffectIntensity,
  },
  error: {
    color: "danger" as BloomColor,
    intensity: "normal" as EffectIntensity,
  },
} as const satisfies Record<
  ConnectionStatus,
  { color: BloomColor; intensity: EffectIntensity }
>;

export interface StatusOrbProps {
  status: ConnectionStatus;
  size?: number;
}

function StatusOrb({ status, size }: StatusOrbProps) {
  const { t } = useI18n();
  const palette = PALETTE[status];
  const isActive = ACTIVE_STATUSES.includes(status);
  const { Icon } = palette;
  const bloomProfile = BLOOM_BY_STATUS[status];
  const bloom = useBloom(bloomProfile.color, bloomProfile.intensity);
  const diameter = size ?? undefined;

  return (
    <div
      className="status-orb relative flex shrink-0 items-center justify-center"
      style={{
        width: diameter ?? "clamp(84px, 12vw, 148px)",
        height: diameter ?? "clamp(84px, 12vw, 148px)",
        boxShadow: isActive && bloom.filter !== "" ? bloom.filter : undefined,
      }}
      role="img"
      aria-label={t("dashboard.orb.aria", {
        status: t(CONNECTION_LABELS[status]),
      })}
    >
      {isActive && bloom.boxShadow !== "" ? (
        <span
          aria-hidden="true"
          className="absolute inset-2 rounded-full"
          style={{ boxShadow: bloom.boxShadow }}
        />
      ) : null}
      {isActive ? (
        <>
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              border: `1px solid ${palette.ring}`,
              willChange: "transform, opacity",
            }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: ANIMATION.easeInOutExpo,
            }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute inset-3 rounded-full"
            style={{
              border: `1px solid ${palette.ring}`,
              willChange: "transform, opacity",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: 0.6,
              ease: ANIMATION.easeInOutExpo,
            }}
          />
        </>
      ) : null}

      <motion.div
        className={`absolute inset-5 rounded-full ${palette.text} flex items-center justify-center`}
        style={{ background: palette.core, willChange: "transform" }}
        animate={
          status === "connecting" ? { scale: [1, 1.06, 1] } : { scale: 1 }
        }
        transition={{
          duration: 1.6,
          repeat: status === "connecting" ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <motion.span
          key={status}
          className="flex size-full items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: ANIMATION.normal }}
        >
          <Icon aria-hidden="true" className="size-[38%]" strokeWidth={1.75} />
        </motion.span>
      </motion.div>
    </div>
  );
}

export default StatusOrb;
