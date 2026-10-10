import { memo } from "react";
import { Globe, Link2 } from "lucide-react";

import CountryFlag from "@/components/dashboard/CountryFlag";
import { Badge } from "@/components/ui";
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
}

function ServerCardImpl({ server, isActive, ping, onSelect }: ServerCardProps) {
  const { t } = useI18n();
  const country = guessCountryCode(server.host);

  return (
    <div
      role="listitem"
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        "duration-200 hover:bg-white/5",
        isActive
          ? "border-accent-primary bg-white/5"
          : "border-white/10 bg-white/5"
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
            className="text-text-tertiary flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5"
          >
            <Globe className="size-4" strokeWidth={2} />
          </span>
        ) : (
          <CountryFlag countryCode={country} size={32} />
        )}

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-text-primary truncate text-sm font-semibold">
            {server.name}
          </span>
          <span className="text-text-tertiary flex items-center gap-1.5 truncate font-mono text-[11px]">
            {server.host}:{server.port}
          </span>
        </span>

        <Badge variant="neutral" size="sm">
          {server.protocol.toUpperCase()}
        </Badge>
      </button>

      <span
        className="shrink-0 font-mono text-xs tabular-nums"
        style={{ color: getPingColor(ping) }}
      >
        {formatPing(ping)}
      </span>

      {isActive ? (
        <Link2
          aria-hidden="true"
          className="text-accent-primary size-4 shrink-0"
          strokeWidth={2}
        />
      ) : null}
    </div>
  );
}

const MemoServerCard = memo(ServerCardImpl);

export default MemoServerCard;
