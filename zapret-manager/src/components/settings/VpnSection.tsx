import { useI18n } from "@/i18n";

import SectionContainer from "@/components/settings/SectionContainer";
import SettingRow from "@/components/settings/SettingRow";
import Toggle from "@/components/ui/Toggle";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Настройки VPN в одном месте.
 *
 * Раньше панель настроек стояла на главной странице в режиме VPN, а часть
 * строк ничего не делала: «Держать соединение» переключала общий флаг VPN, а
 * таймаут рукопожатия и kill switch относились к старому WireGuard-стеку,
 * который в интерфейсе не используется. Здесь только то, что действительно
 * влияет на работу.
 */
export default function VpnSection() {
  const { t } = useI18n();
  const vpn = useSettingsStore((state) => state.settings.vpn);
  const updateVpn = useSettingsStore((state) => state.updateVpn);

  return (
    <SectionContainer
      title={t("settings.vpnPanel.title")}
      description={t("settings.vpnPanel.description")}
    >
      <SettingRow
        label={t("settings.vpn.enabled")}
        description={t("settings.vpn.enabledHint")}
        control={
          <Toggle
            ariaLabel={t("settings.vpn.enabled")}
            checked={vpn.enabled}
            onChange={(value) => {
              updateVpn({ enabled: value });
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
    </SectionContainer>
  );
}
