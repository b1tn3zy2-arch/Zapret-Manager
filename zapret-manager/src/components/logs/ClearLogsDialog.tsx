import { AlertTriangle } from "lucide-react";

import { Button, Modal } from "@/components/ui";

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
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Очистить логи?"
      description={`Будет удалено записей: ${totalCount}. Действие необратимо.`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Очистить
          </Button>
        </>
      }
    >
      <div className="text-text-secondary flex items-start gap-3 text-sm">
        <AlertTriangle
          aria-hidden="true"
          className="text-accent-danger mt-0.5 size-5 shrink-0"
        />
        <span>
          Все строки журнала будут стёрты из памяти приложения. Экспортированные
          ранее файлы останутся на диске.
        </span>
      </div>
    </Modal>
  );
}

export default ClearLogsDialog;
