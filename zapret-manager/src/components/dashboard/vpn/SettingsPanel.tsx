import { useState } from "react";
import { Download, Link2, Trash2 } from "lucide-react";

import { Button, Input, Modal, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useVpnCore } from "@/hooks/useVpnCore";
import { useVpnCoreStore } from "@/stores/useVpnCoreStore";

export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { t } = useI18n();
  const subscriptionUrl = useVpnCoreStore((state) => state.subscriptionUrl);
  const servers = useVpnCoreStore((state) => state.servers);
  const status = useVpnCoreStore((state) => state.status);
  const isLoading = useVpnCoreStore((state) => state.isLoading);
  const error = useVpnCoreStore((state) => state.error);
  const setSubscriptionUrl = useVpnCoreStore(
    (state) => state.setSubscriptionUrl
  );
  const setServers = useVpnCoreStore((state) => state.setServers);
  const [draft, setDraft] = useState(subscriptionUrl);
  const { loadServers, installCore } = useVpnCore();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("dashboard.vpn.settingsPanel")}
      size="md"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Text variant="label" className="text-text-primary">
            {t("dashboard.vpn.coreTitle")}
          </Text>

          <Text variant="body" size="sm" className="text-text-secondary">
            {status?.installed === true
              ? t("dashboard.vpn.coreInstalled")
              : t("dashboard.vpn.coreMissing")}
          </Text>

          {status?.installed !== true ? (
            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => {
                void installCore();
              }}
              icon={
                <Download
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={2}
                />
              }
            >
              {isLoading
                ? t("dashboard.vpn.coreInstalling")
                : t("dashboard.vpn.installCore")}
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Input
            label={t("dashboard.vpn.subscriptionUrl")}
            placeholder="https://example.com/api/sub/..."
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={isLoading || draft.trim() === ""}
              onClick={() => {
                void loadServers(draft.trim());
              }}
              icon={
                <Link2 aria-hidden="true" className="size-4" strokeWidth={2} />
              }
            >
              {isLoading
                ? t("dashboard.vpn.subscriptionLoading")
                : t("dashboard.vpn.subscriptionLoad")}
            </Button>

            {servers.length > 0 ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setServers([]);
                  setSubscriptionUrl("");
                  setDraft("");
                }}
                icon={
                  <Trash2
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={2}
                  />
                }
              >
                {t("dashboard.vpn.subscriptionClear")}
              </Button>
            ) : null}
          </div>

          {servers.length > 0 ? (
            <Text variant="caption" size="sm" className="text-text-tertiary">
              {t("dashboard.vpn.subscriptionCount").replace(
                "{count}",
                String(servers.length)
              )}
            </Text>
          ) : null}
        </div>

        {error !== null ? (
          <Text variant="caption" size="sm" className="text-accent-danger">
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}
