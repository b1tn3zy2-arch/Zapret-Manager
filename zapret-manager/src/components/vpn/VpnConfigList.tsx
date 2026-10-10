import { useState } from "react";
import { Upload } from "lucide-react";

import VpnConfigCard from "@/components/vpn/VpnConfigCard";
import { Button, Modal, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useVpn } from "@/hooks/useVpn";
import { useVpnImport } from "@/hooks/useVpnImport";
import { useVpnStore } from "@/stores/useVpnStore";

function VpnConfigList() {
  const { t } = useI18n();
  const configs = useVpnStore((state) => state.configs);
  const activeId = useVpnStore((state) => state.activeConfigId);
  const isConnected = useVpnStore(
    (state) => state.status.state === "connected"
  );
  const setActive = useVpnStore((state) => state.setActiveConfig);
  const { deleteConfig } = useVpn();
  const { importConfig } = useVpnImport();

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const pending = configs.find((item) => item.id === pendingDelete);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Text variant="label" className="text-text-primary">
          {t("settings.vpn.configsTitle")}
        </Text>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            void importConfig();
          }}
          icon={<Upload aria-hidden="true" className="size-4" />}
        >
          {t("settings.vpn.importConfig")}
        </Button>
      </div>

      {configs.length === 0 ? (
        <div className="flex flex-col gap-1">
          <Text variant="body" size="sm" className="text-text-tertiary">
            {t("settings.vpn.noConfigs")}
          </Text>
          <Text variant="caption" size="sm" className="text-text-tertiary">
            {t("settings.vpn.noConfigsHint")}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {configs.map((config) => (
            <VpnConfigCard
              key={config.id}
              config={config}
              isActive={config.id === activeId}
              isConnected={isConnected}
              onSelect={() => {
                setActive(config.id);
              }}
              onDelete={() => {
                setPendingDelete(config.id);
              }}
            />
          ))}
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        onClose={() => {
          setPendingDelete(null);
        }}
        title={t("settings.vpn.deleteConfigTitle")}
        description={t("settings.vpn.deleteConfigHint")}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setPendingDelete(null);
              }}
            >
              {t("settings.common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (pendingDelete !== null) {
                  void deleteConfig(pendingDelete);
                }
                setPendingDelete(null);
              }}
            >
              {t("settings.vpn.delete")}
            </Button>
          </>
        }
      >
        <Text variant="body" size="sm" className="text-text-secondary">
          {t("settings.vpn.deleteConfigBody").replace(
            "{name}",
            pending?.name ?? ""
          )}
        </Text>
      </Modal>
    </div>
  );
}

export default VpnConfigList;
