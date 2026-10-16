import { memo } from "react";
import { Globe, Trash2 } from "lucide-react";

import CountryFlag from "@/components/dashboard/CountryFlag";
import { useI18n } from "@/i18n";
import { guessCountryCode } from "@/lib/vpnEndpoint";
import { formatPing, getPingColor } from "@/lib/pingUtils";
import { cn } from "@/lib/utils";
import type { SubscriptionServer } from "@/types";

export interface ServerCardProps {
  server: SubscriptionServer;
  isActive: boolean;
  ping: number | null;
  onSelect: (server: SubscriptionServer) => void;
  onRemove: (server: SubscriptionServer) => void;
}

const FLAG_SIZE = 28;
/** Ширина колонки пинга: без неё бейдж и корзина «плавают» по строкам. */
const PING_COLUMN = "w-16";

function ServerCardImpl({
  server,
  isActive,
  ping,
  onSelect,
  onRemove,
}: ServerCardProps) {
  const { t } = useI18n();
  const country = guessCountryCode(server.host);

  return (
    <div
      role="listitem"
      className={cn(
        "flex items-center gap-4 rounded-lg border px-3 py-2.5 transition-colors",
        "hover:bg-glass-hover duration-200",
        isActive
          ? "border-accent-primary bg-glass-bg"
          : "border-glass-border bg-glass-bg"
      )}
    >
      <button
        type="button"
        onClick={() => {
          onSelect(server);
        }}
        aria-label={t("dashboard.vpn.selectServer").replace(
          "{name}",
          server.name
        )}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {country === null ? (
          <span
            aria-hidden="true"
            className="text-text-tertiary border-glass-border bg-glass-bg flex shrink-0 items-center justify-center rounded-md border"
            style={{ width: FLAG_SIZE, height: FLAG_SIZE }}
          >
            <Globe className="size-4" strokeWidth={2} />
          </span>
        ) : (
          <CountryFlag countryCode={country} size={FLAG_SIZE} />
        )}

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-text-primary truncate text-sm font-semibold">
            {server.name}
          </span>
          <span className="text-text-tertiary truncate font-mono text-xs">
            {server.host}:{server.port}
          </span>
        </span>
      </button>

      <span
        className={cn(
          "border-glass-border shrink-0 rounded-md border px-2 py-0.5",
          "text-text-secondary text-[11px] font-medium tracking-wide uppercase"
        )}
      >
        {server.protocol.toUpperCase()}
      </span>

      <span
        className={cn(
          PING_COLUMN,
          "shrink-0 text-right font-mono text-xs font-semibold tabular-nums"
        )}
        style={{ color: getPingColor(ping) }}
      >
        {formatPing(ping)}
      </span>

      <button
        type="button"
        onClick={() => {
          onRemove(server);
        }}
        disabled={isActive}
        aria-label={t("dashboard.vpn.removeServer").replace(
          "{name}",
          server.name
        )}
        className={cn(
          "text-text-tertiary hover:text-accent-danger hover:bg-glass-hover",
          "rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        )}
      >
        <Trash2 aria-hidden="true" className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

const MemoServerCard = memo(ServerCardImpl);

export default MemoServerCard;
