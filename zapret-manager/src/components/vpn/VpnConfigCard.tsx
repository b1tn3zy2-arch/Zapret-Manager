import { Trash2 } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { formatBytes } from "@/lib/trafficUtils";
import type { VpnConfigInfo } from "@/types";

export interface VpnConfigCardProps {
  config: VpnConfigInfo;
  isActive: boolean;
  isConnected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function VpnConfigCard({
  config,
  isActive,
  isConnected,
  onSelect,
  onDelete,
}: VpnConfigCardProps) {
  const { t } = useI18n();

  return (
    <div
      className={
        isActive
          ? "border-accent-primary/40 bg-accent-primary/5 flex items-start justify-between gap-3 rounded-lg border px-3 py-2"
          : "flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
      }
    >
      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
        <input
          type="radio"
          name="vpn-config"
          checked={isActive}
          onChange={onSelect}
          className="accent-accent-primary mt-1"
          aria-label={`${t("settings.vpn.setActive")} ${config.name}`}
        />

        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-text-primary truncate text-sm font-medium">
            {config.name}
          </span>
          <span className="text-text-secondary truncate font-mono text-xs">
            {config.endpoint}
          </span>
          <span className="text-text-tertiary truncate text-xs">
            {config.address.join(", ")} · {formatBytes(config.size)}
          </span>
        </span>
      </label>

      <div className="flex shrink-0 items-center gap-2">
        {isConnected ? (
          <Text variant="caption" size="sm" className="text-accent-primary">
            {t("settings.vpn.active")}
          </Text>
        ) : null}

        <Button
          size="icon"
          variant="ghost"
          disabled={isConnected}
          aria-label={`${t("settings.vpn.delete")} ${config.name}`}
          title={t("settings.vpn.delete")}
          onClick={onDelete}
          icon={<Trash2 className="size-4" />}
        />
      </div>
    </div>
  );
}

export default VpnConfigCard;
