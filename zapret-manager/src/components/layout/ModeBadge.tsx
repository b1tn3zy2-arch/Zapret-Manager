import { Lock } from "lucide-react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { useConnectionStatus } from "@/stores/selectors";

export interface ModeBadgeProps {
  onClick?: () => void;
}

function ModeBadge({ onClick }: ModeBadgeProps) {
  const { t } = useI18n();
  const status = useConnectionStatus();

  const { label, tone } =
    status === "vpn"
      ? { label: t("settings.vpn.badgeVpn"), tone: "vpn" as const }
      : status === "connected"
        ? { label: t("settings.vpn.badgeDpi"), tone: "dpi" as const }
        : { label: t("settings.vpn.badgeOff"), tone: "off" as const };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("settings.vpn.badgeAriaLabel").replace("{mode}", label)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-[11px] font-semibold tracking-wide transition-colors",
        tone === "vpn" && "bg-accent-secondary/15 text-accent-secondary",
        tone === "dpi" && "bg-accent-primary/15 text-accent-primary",
        tone === "off" && "text-text-tertiary bg-white/5"
      )}
    >
      <Lock
        aria-hidden="true"
        className={cn("size-3", tone === "off" ? "opacity-50" : "opacity-90")}
        strokeWidth={2.5}
      />
      {label}
    </button>
  );
}

export default ModeBadge;
