import { Button, Modal, Text } from "@/components/ui";
import { useI18n } from "@/i18n";

export interface VpnKillSwitchWarningProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function VpnKillSwitchWarning({
  open,
  onCancel,
  onConfirm,
}: VpnKillSwitchWarningProps) {
  const { t } = useI18n();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={t("settings.vpn.killSwitchTitle")}
      description={t("settings.vpn.killSwitchNeedsAdmin")}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("settings.common.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t("settings.vpn.killSwitchEnable")}
          </Button>
        </>
      }
    >
      <Text variant="body" size="sm" className="text-text-secondary">
        {t("settings.vpn.killSwitchBody")}
      </Text>
    </Modal>
  );
}

export default VpnKillSwitchWarning;
