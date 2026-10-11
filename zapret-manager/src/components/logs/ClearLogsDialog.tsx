import { AlertTriangle } from "lucide-react";

import { Button, Modal } from "@/components/ui";
import { useI18n } from "@/i18n";

export interface ClearLogsDialogProps {
  open: boolean;
  totalCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

function ClearLogsDialog({
  open,
  totalCount,
  onCancel,
  onConfirm,
}: ClearLogsDialogProps) {
  const { t } = useI18n();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={t("logs.clearDialog.title")}
      description={t("logs.clearDialog.description", { count: totalCount })}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t("logs.clear")}
          </Button>
        </>
      }
    >
      <div className="text-text-secondary flex items-start gap-3 text-sm">
        <AlertTriangle
          aria-hidden="true"
          className="text-accent-danger mt-0.5 size-5 shrink-0"
        />
        <span>{t("logs.clearDialog.body")}</span>
      </div>
    </Modal>
  );
}

export default ClearLogsDialog;
