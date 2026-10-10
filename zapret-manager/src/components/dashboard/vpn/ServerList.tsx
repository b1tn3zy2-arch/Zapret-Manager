import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

import ServerCard from "@/components/dashboard/vpn/ServerCard";
import { Badge, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { ANIMATION } from "@/lib/constants";
import type { SubscriptionServer } from "@/types";

export interface ServerListProps {
  servers: SubscriptionServer[];
  activeServerId: string | null;
  pings: ReadonlyMap<string, number | null>;
  isRefreshing: boolean;
  onSelect: (server: SubscriptionServer) => void;
  onRefreshPings: () => void;
  onRefreshSubscription: () => void;
}

export default function ServerList({
  servers,
  activeServerId,
  pings,
  isRefreshing,
  onSelect,
  onRefreshPings,
  onRefreshSubscription,
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
            {servers.length}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefreshSubscription}
            disabled={isRefreshing}
            aria-label={t("dashboard.vpn.refreshSubscription")}
            className="text-text-tertiary hover:text-text-primary rounded-md p-1.5 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>

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
      </div>

      {servers.length === 0 ? (
        <Text variant="body" size="sm" className="text-text-tertiary">
          {t("dashboard.vpn.noConfigs")}
        </Text>
      ) : (
        <div role="list" className="flex flex-col gap-2">
          {servers.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: ANIMATION.fast,
                delay: Math.min(index * 0.03, 0.3),
              }}
            >
              <ServerCard
                server={server}
                isActive={server.id === activeServerId}
                ping={pings.get(server.id) ?? null}
                onSelect={onSelect}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
