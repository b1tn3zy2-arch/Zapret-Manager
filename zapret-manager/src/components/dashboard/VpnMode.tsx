import { useCallback, useState } from "react";

import ActionsRow from "@/components/dashboard/vpn/ActionsRow";
import ConnectButton from "@/components/dashboard/vpn/ConnectButton";
import EmptyState from "@/components/dashboard/vpn/EmptyState";
import ServerList from "@/components/dashboard/vpn/ServerList";
import SettingsPanel from "@/components/dashboard/vpn/SettingsPanel";
import VpnFooter from "@/components/dashboard/vpn/Footer";
import WireguardNotInstalled from "@/components/vpn/WireguardNotInstalled";
import { Button, Modal } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useVpn } from "@/hooks/useVpn";
import { useVpnImport } from "@/hooks/useVpnImport";
import { useVpnPings } from "@/hooks/useVpnPings";
import { selectActiveConfig, useVpnStore } from "@/stores/useVpnStore";

export interface VpnModeProps {
  onOpenConfigMenu?: (configId: string) => void;
}

export default function VpnMode({ onOpenConfigMenu }: VpnModeProps = {}) {
  const { t } = useI18n();
  const configs = useVpnStore((state) => state.configs);
  const activeConfigId = useVpnStore((state) => state.activeConfigId);
  const status = useVpnStore((state) => state.status);
  const switchStep = useVpnStore((state) => state.switchStep);
  const isSwitching = useVpnStore((state) => state.isSwitching);
  const installed = useVpnStore((state) => state.wireguardInstalled);
  const activeConfig = useVpnStore(selectActiveConfig);

  const { connect, connectActive, disconnect, deleteConfig } = useVpn();
  const { importConfig, importConfigFromClipboard } = useVpnImport();

  const { pings, isRefreshing, refresh } = useVpnPings(configs);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuConfigId, setMenuConfigId] = useState<string | null>(null);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const menuConfig = configs.find((item) => item.id === menuConfigId) ?? null;

  const isConnected = status.state === "connected";
  const isBusy = isSwitching || status.state === "connecting";

  const handleToggle = useCallback((): void => {
    if (isConnected) {
      void disconnect();
      return;
    }

    void connectActive();
  }, [connectActive, disconnect, isConnected]);

  const handleSelect = useCallback(
    (configId: string): void => {
      void connect(configId);
    },
    [connect]
  );

  const handleOpenMenu = useCallback(
    (configId: string): void => {
      if (onOpenConfigMenu !== undefined) {
        onOpenConfigMenu(configId);
        return;
      }

      setMenuConfigId((current) => (current === configId ? null : configId));
    },
    [onOpenConfigMenu]
  );

  const handlePaste = useCallback((): void => {
    setPasteNotice(null);

    void importConfigFromClipboard().then((config) => {
      if (config === null) {
        setPasteNotice(t("dashboard.vpn.pasteEmpty"));
      }
    });
  }, [importConfigFromClipboard, t]);

  if (!installed) {
    return <WireguardNotInstalled />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ConnectButton
        status={status.state}
        isSwitching={isSwitching}
        switchStep={switchStep}
        activeServerName={activeConfig?.name ?? null}
        onClick={handleToggle}
      />

      <ActionsRow
        disabled={isBusy}
        onAddFile={() => {
          void importConfig();
        }}
        onPaste={handlePaste}
        onOpenSettings={() => {
          setSettingsOpen(true);
        }}
      />

      {pasteNotice !== null ? (
        <p className="text-accent-warning text-center text-xs">{pasteNotice}</p>
      ) : null}

      {configs.length === 0 ? (
        <EmptyState
          disabled={isBusy}
          onChooseFile={() => {
            void importConfig();
          }}
          onDrop={() => {
            void importConfig();
          }}
        />
      ) : (
        <ServerList
          configs={configs}
          activeConfigId={activeConfigId}
          pings={pings}
          isRefreshing={isRefreshing}
          onSelect={handleSelect}
          onOpenMenu={handleOpenMenu}
          onRefreshPings={refresh}
        />
      )}

      <VpnFooter status={status} />

      <Modal
        open={menuConfig !== null}
        onClose={() => {
          setMenuConfigId(null);
        }}
        title={menuConfig?.name ?? ""}
        size="sm"
      >
        <div className="flex flex-col gap-3">
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              const id = menuConfig?.id;

              setMenuConfigId(null);

              if (id !== undefined) {
                void deleteConfig(id);
              }
            }}
          >
            {t("dashboard.vpn.delete")}
          </Button>
        </div>
      </Modal>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
        }}
      />
    </div>
  );
}
