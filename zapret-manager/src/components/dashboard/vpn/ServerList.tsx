import { RefreshCw } from "lucide-react";

import ServerCard from "@/components/dashboard/vpn/ServerCard";
import { Badge, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import type { VpnConfigInfo } from "@/types";

export interface ServerListProps {
  configs: VpnConfigInfo[];
  activeConfigId: string | null;
  pings: ReadonlyMap<string, number | null>;
  isRefreshing: boolean;
  onSelect: (id: string) => void;
  onOpenMenu: (id: string) => void;
  onRefreshPings: () => void;
}

export default function ServerList({
  configs,
  activeConfigId,
  pings,
  isRefreshing,
  onSelect,
  onOpenMenu,
  onRefreshPings,
}: ServerListProps) {
  const { t } = useI18n();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-text-tertiary text-xs font-semibold tracking-widest">
            {t("dashboard.vpn.servers")}
          </h3>
          <Badge variant="neutral" size="sm">
            {configs.length}
          </Badge>
        </div>

        <button
          type="button"
          onClick={onRefreshPings}
          disabled={isRefreshing}
          aria-label={t("dashboard.vpn.refreshPingsAria")}
          className="text-text-tertiary hover:text-text-primary rounded-md p-1.5 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            aria-hidden="true"
            className={isRefreshing ? "size-4 animate-spin" : "size-4"}
            strokeWidth={2}
          />
        </button>
      </div>

      {configs.length === 0 ? (
        <Text variant="body" size="sm" className="text-text-tertiary">
          {t("dashboard.vpn.noConfigs")}
        </Text>
      ) : (
        <ul className="flex flex-col gap-2">
          {configs.map((config) => (
            <ServerCard
              key={config.id}
              config={config}
              isActive={config.id === activeConfigId}
              ping={pings.get(config.id) ?? null}
              onSelect={onSelect}
              onOpenMenu={onOpenMenu}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
