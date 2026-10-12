import { useI18n } from "@/i18n";
import SectionContainer from "@/components/settings/SectionContainer";
import SettingRow from "@/components/settings/SettingRow";
import Toggle from "@/components/ui/Toggle";
import { Slider } from "@/components/ui";
import { useSettingsStore } from "@/stores/useSettingsStore";

const MIN_HANDSHAKE_SEC = 3;
const MAX_HANDSHAKE_SEC = 60;

export default function VpnSettingsPanel() {
  const { t } = useI18n();
  const vpn = useSettingsStore((state) => state.settings.vpn);
  const updateVpn = useSettingsStore((state) => state.updateVpn);

  return (
    <SectionContainer
      title={t("settings.vpnPanel.title")}
      description={t("settings.vpnPanel.description")}
    >
      <SettingRow
        label={t("settings.vpnPanel.handshake")}
        description={t("settings.vpnPanel.handshakeHint")}
        control={
          <Slider
            className="w-56"
            value={vpn.handshakeTimeoutSec}
            min={MIN_HANDSHAKE_SEC}
            max={MAX_HANDSHAKE_SEC}
            step={1}
            ariaLabel={t("settings.vpnPanel.handshake")}
            formatValue={(value) => `${value}s`}
            onChange={(handshakeTimeoutSec) => {
              updateVpn({ handshakeTimeoutSec });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.vpnPanel.autoConnectOnStart")}
        description={t("settings.vpnPanel.autoConnectOnStartHint")}
        control={
          <Toggle
            ariaLabel={t("settings.vpnPanel.autoConnectOnStart")}
            checked={vpn.autoConnectOnStart}
            onChange={(value) => {
              updateVpn({ autoConnectOnStart: value });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.vpnPanel.killSwitch")}
        description={t("settings.vpnPanel.killSwitchHint")}
        control={
          <Toggle
            ariaLabel={t("settings.vpnPanel.killSwitch")}
            checked={vpn.killSwitch}
            onChange={(value) => {
              updateVpn({ killSwitch: value });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.vpnPanel.keepAlive")}
        description={t("settings.vpnPanel.keepAliveHint")}
        control={
          <Toggle
            ariaLabel={t("settings.vpnPanel.keepAlive")}
            checked={vpn.enabled}
            onChange={(value) => {
              updateVpn({ enabled: value });
            }}
          />
        }
      />
    </SectionContainer>
  );
}
