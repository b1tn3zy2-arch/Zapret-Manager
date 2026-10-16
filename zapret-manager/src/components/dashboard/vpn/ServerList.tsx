import { motion } from "framer-motion";
import { RefreshCw, Trash2 } from "lucide-react";

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
  onClearSubscription: () => void;
  onRemoveServer: (server: SubscriptionServer) => void;
}

/**
 * Порядок вывода: сначала серверы с известным пингом от лучшего к худшему,
 * серверы без замера — в конец, порядок между ними сохраняется из подписки.
 * Активный сервер всегда остаётся на своём месте: перестановка списка во время
 * подключения отправляла бы строку вверх или вниз под курсором.
 */
function sortServers(
  servers: SubscriptionServer[],
  pings: ReadonlyMap<string, number | null>,
  activeServerId: string | null
): SubscriptionServer[] {
  return [...servers]
    .map((server, index) => ({ server, index }))
    .sort((left, right) => {
      if (left.server.id === activeServerId) {
        return right.server.id === activeServerId ? 0 : 1;
      }

      if (right.server.id === activeServerId) {
        return -1;
      }

      const leftPing = pings.get(left.server.id);
      const rightPing = pings.get(right.server.id);

      if (leftPing === leftPing && rightPing === rightPing) {
        return left.index - right.index;
      }

      if (leftPing === leftPing) {
        return -1;
      }

      if (rightPing === rightPing) {
        return 1;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.server);
}

export default function ServerList({
  servers,
  activeServerId,
  pings,
  isRefreshing,
  onSelect,
  onRefreshPings,
  onRefreshSubscription,
  onClearSubscription,
  onRemoveServer,
}: ServerListProps) {
  const { t } = useI18n();
  const ordered = sortServers(servers, pings, activeServerId);

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
            onClick={() => {
              onRefreshSubscription();

              if (servers.length > 0) {
                onRefreshPings();
              }
            }}
            disabled={isRefreshing}
            aria-label={t("dashboard.vpn.refreshAll")}
            className="text-text-tertiary hover:text-text-primary hover:bg-glass-hover rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              aria-hidden="true"
              className={isRefreshing ? "size-4 animate-spin" : "size-4"}
              strokeWidth={2}
            />
          </button>
          <button
            type="button"
            onClick={onClearSubscription}
            disabled={isRefreshing || servers.length === 0}
            aria-label={t("dashboard.vpn.clearSubscription")}
            className="text-text-tertiary hover:text-accent-danger hover:bg-glass-hover rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {servers.length === 0 ? (
        <Text variant="body" size="sm" className="text-text-tertiary">
          {t("dashboard.vpn.noConfigs")}
        </Text>
      ) : (
        <div role="list" className="flex flex-col gap-2">
          {ordered.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: ANIMATION.fast,
                delay: Math.min(index * 0.02, 0.25),
              }}
            >
              <ServerCard
                server={server}
                isActive={server.id === activeServerId}
                ping={pings.get(server.id) ?? null}
                onSelect={onSelect}
                onRemove={onRemoveServer}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
