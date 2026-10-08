import { openExternalUrl } from "@/lib/userCommands";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useVpn } from "@/hooks/useVpn";
import { WIREGUARD_DOWNLOAD_URL } from "@/lib/vpnConstants";

function WireguardNotInstalled() {
  const { t } = useI18n();
  const { detectWireguard } = useVpn();

  return (
    <div className="border-accent-warning/30 bg-accent-warning/5 flex flex-col gap-3 rounded-lg border px-4 py-4">
      <div className="flex items-center gap-2">
        <AlertTriangle
          aria-hidden="true"
          className="text-accent-warning size-5"
          strokeWidth={2}
        />
        <Text variant="label" className="text-text-primary">
          {t("settings.vpn.notInstalled")}
        </Text>
      </div>

      <Text variant="body" size="sm" className="text-text-secondary">
        {t("settings.vpn.notInstalledHint")}
      </Text>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            void openExternalUrl(WIREGUARD_DOWNLOAD_URL).catch(() => undefined);
          }}
          icon={<Download aria-hidden="true" className="size-4" />}
        >
          {t("settings.vpn.openInstaller")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            void detectWireguard();
          }}
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
        >
          {t("settings.vpn.recheck")}
        </Button>
      </div>
    </div>
  );
}

export default WireguardNotInstalled;
