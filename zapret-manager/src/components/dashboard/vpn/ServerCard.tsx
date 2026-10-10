import { memo } from "react";
import { Globe, MoreVertical } from "lucide-react";

import CountryFlag from "@/components/dashboard/CountryFlag";
import { useI18n } from "@/i18n";
import { guessCountryCode } from "@/lib/vpnEndpoint";
import { formatPing, getPingColor } from "@/lib/pingUtils";
import { cn } from "@/lib/utils";
import type { VpnConfigInfo } from "@/types";

export interface ServerCardProps {
  config: VpnConfigInfo;
  isActive: boolean;
  ping: number | null;
  onSelect: (id: string) => void;
  onOpenMenu: (id: string) => void;
}

function ServerCardImpl({
  config,
  isActive,
  ping,
  onSelect,
  onOpenMenu,
}: ServerCardProps) {
  const { t } = useI18n();
  const country = guessCountryCode(config.endpoint);

  return (
    <li
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
          onSelect(config.id);
        }}
        aria-label={t("dashboard.vpn.selectServer").replace(
          "{name}",
          config.name
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
            {config.name}
          </span>
          <span className="text-text-tertiary truncate font-mono text-[11px]">
            {config.endpoint === ""
              ? t("dashboard.vpn.endpointUnknown")
              : config.endpoint}
          </span>
        </span>
      </button>

      <span
        className="shrink-0 font-mono text-xs tabular-nums"
        style={{ color: getPingColor(ping) }}
      >
        {formatPing(ping)}
      </span>

      <button
        type="button"
        onClick={() => {
          onOpenMenu(config.id);
        }}
        aria-label={`${t("dashboard.vpn.moreActions")}: ${config.name}`}
        className="text-text-tertiary hover:text-text-primary shrink-0 rounded-md p-1 transition-colors hover:bg-white/5"
      >
        <MoreVertical aria-hidden="true" className="size-4" strokeWidth={2} />
      </button>
    </li>
  );
}

const MemoServerCard = memo(ServerCardImpl);

export default MemoServerCard;
