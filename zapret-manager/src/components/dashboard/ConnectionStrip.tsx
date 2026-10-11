import { memo } from "react";
import { RefreshCw } from "lucide-react";

import CountryFlag from "@/components/dashboard/CountryFlag";
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const EMPTY = "—";

function ConnectionStrip() {
  const { t } = useI18n();
  const { info, isLoading, refresh } = useNetworkInfo();

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      {info === null ? (
        <span className="border-glass-border bg-glass-bg size-4 shrink-0 rounded-full border" />
      ) : (
        <CountryFlag
          countryCode={info.countryCode}
          countryName={info.country}
          size={16}
        />
      )}
      <span className="text-text-secondary">
        {info?.country || EMPTY}
        {info?.city === undefined ? "" : ` · ${info.city}`}
      </span>
      <span className="text-text-primary font-mono">{info?.ip || EMPTY}</span>
      <span className="text-text-tertiary truncate">
        {t("dashboard.connection.isp")}: {info?.isp || EMPTY}
      </span>
      <button
        type="button"
        aria-label={t("dashboard.connection.refreshAria")}
        disabled={isLoading}
        onClick={() => {
          void refresh();
        }}
        className={cn(
          "text-text-tertiary hover:text-text-primary rounded p-0.5 transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <RefreshCw
          aria-hidden="true"
          className={isLoading ? "size-3 animate-spin" : "size-3"}
          strokeWidth={2}
        />
      </button>
    </span>
  );
}

export default memo(ConnectionStrip);
