import { useCallback, useState } from "react";

import { GlassPanel } from "@/components/shared/GlassPanel";
import ActionsRow from "@/components/dashboard/vpn/ActionsRow";
import ConnectButton from "@/components/dashboard/vpn/ConnectButton";
import EmptyState from "@/components/dashboard/vpn/EmptyState";
import ServerList from "@/components/dashboard/vpn/ServerList";
import VpnConnectedPanel from "@/components/dashboard/vpn/VpnConnectedPanel";
import { Button, Input, Modal, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useVpnCore } from "@/hooks/useVpnCore";
import { useSubscriptionPings } from "@/hooks/useSubscriptionPings";
import { useVpnTraffic, useVpnUptime } from "@/hooks/useVpnTraffic";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useVpnCoreStore } from "@/stores/useVpnCoreStore";
import { validateVpnSource } from "@/lib/vpnEndpoint";
import type { SubscriptionServer } from "@/types";

export default function VpnMode() {
  const { t } = useI18n();
  const servers = useVpnCoreStore((state) => state.servers);
  const status = useVpnCoreStore((state) => state.status);
  const activeServerId = useVpnCoreStore((state) => state.activeServerId);
  const subscriptionUrl = useVpnCoreStore((state) => state.subscriptionUrl);
  const isLoading = useVpnCoreStore((state) => state.isLoading);
  const error = useVpnCoreStore((state) => state.error);

  const clearSubscription = useVpnCoreStore((state) => state.clearSubscription);
  const removeServer = useVpnCoreStore((state) => state.removeServer);
  const vpnEnabled = useSettingsStore((state) => state.settings.vpn.enabled);
  const { loadServers, connectServer, disconnect } = useVpnCore();
  const { pings, isRefreshing, refresh } = useSubscriptionPings(servers);

  const [linkOpen, setLinkOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [draftLink, setDraftLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const connected = status?.running === true;
  const connecting = isLoading && !connected;
  const activeServer =
    servers.find((server) => server.id === activeServerId) ?? null;
  // Кнопка подключения работает всегда: берёт выбранный сервер, а если его нет —
  // первый из списка. Раньше она оставалась выключенной, пока пользователь не
  // выбрал сервер, то есть подключиться было нечем.
  const targetServer = activeServer ?? servers[0] ?? null;
  const traffic = useVpnTraffic(connected);
  const uptime = useVpnUptime(status);

  const handleToggle = useCallback((): void => {
    if (connected) {
      void disconnect();
      return;
    }

    if (!vpnEnabled) {
      return;
    }

    if (targetServer !== null) {
      void connectServer(targetServer);
    }
  }, [connectServer, connected, disconnect, targetServer, vpnEnabled]);

  const handleSelect = useCallback(
    (server: SubscriptionServer): void => {
      if (connected || isLoading || !vpnEnabled) {
        return;
      }

      void connectServer(server);
    },
    [connectServer, connected, isLoading, vpnEnabled]
  );

  const handleRemoveServer = useCallback(
    (server: SubscriptionServer): void => {
      removeServer(server.id);
    },
    [removeServer]
  );

  const handlePasteLink = useCallback((): void => {
    void navigator.clipboard
      .readText()
      .then((text) => {
        const value = text.trim();

        if (value === "") {
          setLinkError(t("dashboard.vpn.pasteEmpty"));
          return;
        }

        setDraftLink(value);
        setLinkError(null);
        setLinkOpen(true);
      })
      .catch(() => {
        setLinkOpen(true);
      });
  }, [t]);

  const handleApplyLink = useCallback((): void => {
    const check = validateVpnSource(draftLink);

    if (check !== null) {
      setLinkError(check);
      return;
    }

    setLinkError(null);
    setLinkOpen(false);
    void loadServers(draftLink.trim());
  }, [draftLink, loadServers]);

  return (
    <div className="flex flex-col gap-6">
      {connected ? (
        <VpnConnectedPanel
          speedIn={traffic.speedIn}
          speedOut={traffic.speedOut}
          uptimeSec={uptime}
          serverName={activeServer?.name ?? null}
        />
      ) : null}

      <GlassPanel
        variant="outlined"
        padding="lg"
        className="flex flex-col items-center gap-5 border-0"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <ConnectButton
          connected={connected}
          connecting={connecting}
          isSwitching={isLoading}
          switchStep={null}
          activeServerName={targetServer?.name ?? null}
          vpnDisabled={!vpnEnabled}
          disabled={!vpnEnabled || servers.length === 0}
          onClick={handleToggle}
        />

        <ActionsRow
          disabled={isLoading}
          onAddLink={() => {
            setDraftLink(subscriptionUrl);
            setLinkError(null);
            setLinkOpen(true);
          }}
          onPasteLink={handlePasteLink}
        />

        {error !== null ? (
          <p className="text-accent-danger text-center text-xs">{error}</p>
        ) : null}
      </GlassPanel>

      {servers.length === 0 ? (
        <EmptyState
          disabled={isLoading}
          onAddLink={() => {
            setDraftLink(subscriptionUrl);
            setLinkError(null);
            setLinkOpen(true);
          }}
        />
      ) : (
        <ServerList
          servers={servers}
          activeServerId={activeServerId}
          pings={pings}
          isRefreshing={isRefreshing}
          onSelect={handleSelect}
          onRefreshPings={refresh}
          onRefreshSubscription={() => {
            if (subscriptionUrl !== "") {
              void loadServers(subscriptionUrl);
            }
          }}
          onClearSubscription={() => {
            setClearOpen(true);
          }}
          onRemoveServer={handleRemoveServer}
        />
      )}

      <Modal
        open={clearOpen}
        onClose={() => {
          setClearOpen(false);
        }}
        title={t("dashboard.vpn.clearAllTitle")}
        description={t("dashboard.vpn.clearAllHint")}
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setClearOpen(false);
            }}
          >
            {t("common.cancel")}
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setClearOpen(false);
              clearSubscription();
            }}
          >
            {t("common.delete")}
          </Button>
        </div>
      </Modal>

      <Modal
        open={linkOpen}
        onClose={() => {
          setLinkOpen(false);
        }}
        title={t("dashboard.vpn.addLinkTitle")}
        description={t("dashboard.vpn.addLinkHint")}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Input
            data-focus-quiet
            label={t("dashboard.vpn.subscriptionUrl")}
            placeholder={t("dashboard.vpn.linkPlaceholder")}
            value={draftLink}
            error={linkError !== null}
            errorMessage={linkError ?? undefined}
            onChange={(event) => {
              setDraftLink(event.target.value);
            }}
          />

          {error !== null ? (
            <Text variant="caption" size="sm" className="text-accent-danger">
              {error}
            </Text>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setLinkOpen(false);
              }}
            >
              {t("licenses.close")}
            </Button>

            <Button size="sm" disabled={isLoading} onClick={handleApplyLink}>
              {isLoading
                ? t("dashboard.vpn.subscriptionLoading")
                : t("dashboard.vpn.subscriptionLoad")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
