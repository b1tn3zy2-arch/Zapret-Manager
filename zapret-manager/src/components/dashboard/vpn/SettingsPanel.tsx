import { useState } from "react";

import SettingRow from "@/components/settings/SettingRow";
import VpnKillSwitchWarning from "@/components/vpn/VpnKillSwitchWarning";
import { Input, Modal, Toggle } from "@/components/ui";
import { useI18n } from "@/i18n";
import {
  MAX_HANDSHAKE_TIMEOUT_SEC,
  MIN_HANDSHAKE_TIMEOUT_SEC,
} from "@/lib/settingsSchema";
import { useSettingsStore } from "@/stores/useSettingsStore";

export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

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

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { t } = useI18n();
  const [warning, setWarning] = useState(false);

  const autoConnectOnStart = useSettingsStore(
    (state) => state.settings.vpn.autoConnectOnStart
  );
  const killSwitch = useSettingsStore((state) => state.settings.vpn.killSwitch);
  const handshakeTimeoutSec = useSettingsStore(
    (state) => state.settings.vpn.handshakeTimeoutSec
  );
  const updateVpn = useSettingsStore((state) => state.updateVpn);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={t("dashboard.vpn.settingsPanel")}
        description={t("settings.vpn.description")}
        size="md"
      >
        <div className="flex flex-col gap-4">
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
        </div>
      </Modal>

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
    </>
  );
}
