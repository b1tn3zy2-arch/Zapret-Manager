import { useState } from "react";

import SectionContainer from "@/components/settings/SectionContainer";
import SettingRow from "@/components/settings/SettingRow";
import VpnConfigList from "@/components/vpn/VpnConfigList";
import VpnKillSwitchWarning from "@/components/vpn/VpnKillSwitchWarning";
import VpnStatusCard from "@/components/vpn/VpnStatusCard";
import WireguardNotInstalled from "@/components/vpn/WireguardNotInstalled";
import { Input, Text, Toggle } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useVpn } from "@/hooks/useVpn";
import {
  MAX_HANDSHAKE_TIMEOUT_SEC,
  MIN_HANDSHAKE_TIMEOUT_SEC,
} from "@/lib/settingsSchema";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useVpnStore } from "@/stores/useVpnStore";

function clampTimeout(value: string): number {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return MIN_HANDSHAKE_TIMEOUT_SEC;
  }

  return Math.min(
    Math.max(parsed, MIN_HANDSHAKE_TIMEOUT_SEC),
    MAX_HANDSHAKE_TIMEOUT_SEC
  );
}

function VpnSection() {
  const { t } = useI18n();
  const installed = useVpnStore((state) => state.wireguardInstalled);
  const status = useVpnStore((state) => state.status);
  const isSwitching = useVpnStore((state) => state.isSwitching);
  const activeId = useVpnStore((state) => state.activeConfigId);

  const autoConnectOnStart = useSettingsStore(
    (state) => state.settings.vpn.autoConnectOnStart
  );
  const killSwitch = useSettingsStore((state) => state.settings.vpn.killSwitch);
  const handshakeTimeoutSec = useSettingsStore(
    (state) => state.settings.vpn.handshakeTimeoutSec
  );
  const updateVpn = useSettingsStore((state) => state.updateVpn);

  const { connectActive, disconnect, switchToDpi, error } = useVpn();
  const [warning, setWarning] = useState(false);

  return (
    <SectionContainer
      title={t("settings.vpn.title")}
      description={t("settings.vpn.description")}
    >
      {installed ? (
        <div className="flex flex-col gap-5 py-3">
          <VpnConfigList />

          <SettingRow
            label={t("settings.vpn.autoConnect")}
            description={t("settings.vpn.autoConnectHint")}
            control={
              <Toggle
                ariaLabel={t("settings.vpn.autoConnect")}
                checked={autoConnectOnStart}
                onChange={(value) => {
                  updateVpn({ autoConnectOnStart: value });
                }}
              />
            }
          />

          <SettingRow
            label={t("settings.vpn.killSwitch")}
            description={t("settings.vpn.killSwitchHint")}
            control={
              <Toggle
                ariaLabel={t("settings.vpn.killSwitch")}
                checked={killSwitch}
                onChange={(value) => {
                  if (value) {
                    setWarning(true);
                    return;
                  }

                  updateVpn({ killSwitch: false });
                }}
              />
            }
          />

          <SettingRow
            label={t("settings.vpn.handshakeTimeout")}
            description={t("settings.vpn.handshakeTimeoutHint")}
            control={
              <Input
                variant="filled"
                type="number"
                min={MIN_HANDSHAKE_TIMEOUT_SEC}
                max={MAX_HANDSHAKE_TIMEOUT_SEC}
                value={String(handshakeTimeoutSec)}
                aria-label={t("settings.vpn.handshakeTimeout")}
                onChange={(event) => {
                  updateVpn({
                    handshakeTimeoutSec: clampTimeout(event.target.value),
                  });
                }}
              />
            }
          />

          <VpnStatusCard
            status={status}
            isSwitching={isSwitching}
            hasConfig={activeId !== null}
            onConnect={() => {
              void connectActive();
            }}
            onDisconnect={() => {
              void disconnect();
            }}
            onSwitchToDpi={() => {
              void switchToDpi();
            }}
          />

          {error !== null && error !== "" ? (
            <Text variant="caption" size="sm" className="text-accent-danger">
              {error}
            </Text>
          ) : null}
        </div>
      ) : (
        <div className="py-3">
          <WireguardNotInstalled />
        </div>
      )}

      <VpnKillSwitchWarning
        open={warning}
        onCancel={() => {
          setWarning(false);
        }}
        onConfirm={() => {
          setWarning(false);
          updateVpn({ killSwitch: true });
        }}
      />
    </SectionContainer>
  );
}

export default VpnSection;
