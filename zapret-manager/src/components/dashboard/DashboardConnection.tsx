import { memo } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import CountryFlag from "@/components/dashboard/CountryFlag";
import { Button, Spinner, Text } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { useI18n } from "@/i18n";

const EMPTY_VALUE = "—";

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-tertiary text-xs">{label}</span>
      <span
        className={
          mono
            ? "text-text-primary font-mono text-sm"
            : "text-text-secondary truncate text-sm"
        }
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function DashboardConnection() {
  const { t } = useI18n();
  const { info, isLoading, error, refresh } = useNetworkInfo();

  return (
    <GlassPanel padding="lg" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-text-primary text-base font-semibold">
          {t("dashboard.connection.title")}
        </h3>

        <Button
          size="icon"
          variant="ghost"
          aria-label={t("dashboard.connection.refreshAria")}
          title={t("dashboard.connection.refresh")}
          disabled={isLoading}
          onClick={() => {
            void refresh();
          }}
          icon={
            isLoading ? (
              <Spinner size="sm" />
            ) : (
              <RefreshCw className="size-4" strokeWidth={2} />
            )
          }
        />
      </div>

      <div className="flex items-center gap-3">
        {info === null ? (
          <div className="border-glass-border bg-glass-bg size-8 shrink-0 rounded-full border" />
        ) : (
          <CountryFlag
            countryCode={info.countryCode}
            countryName={info.country}
            size={32}
          />
        )}

        <div className="flex min-w-0 flex-col">
          <span className="text-text-primary truncate text-sm font-medium">
            {info?.country || EMPTY_VALUE}
          </span>
          <span className="text-text-tertiary truncate text-xs">
            {info?.city || EMPTY_VALUE}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Row
          label={t("dashboard.connection.ip")}
          value={info?.ip || EMPTY_VALUE}
          mono
        />
        <Row
          label={t("dashboard.connection.isp")}
          value={info?.isp || EMPTY_VALUE}
        />
      </div>

      {error !== null ? (
        <Text
          variant="caption"
          size="sm"
          className="text-accent-danger flex items-start gap-1.5"
        >
          <TriangleAlert
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0"
            strokeWidth={2}
          />
          <span>{t("dashboard.connection.failed", { error })}</span>
        </Text>
      ) : null}
    </GlassPanel>
  );
}

const MemoDashboardConnection = memo(DashboardConnection);

export default MemoDashboardConnection;
