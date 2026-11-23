// Импортируем зависимости из модуля lucide-react.
import { AlertTriangle } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Modal } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ClearLogsDialogProps {
  // Обрабатываем конструкцию: open.
  open: boolean;
  // Обрабатываем конструкцию: totalCount.
  totalCount: number;
  // Обрабатываем конструкцию: onCancel.
  onCancel: () => void;
  // Обрабатываем конструкцию: onConfirm.
  onConfirm: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию ClearLogsDialog.
function ClearLogsDialog({
  // Обрабатываем конструкцию: open.
  open,
  // Обрабатываем конструкцию: totalCount.
  totalCount,
  // Обрабатываем конструкцию: onCancel.
  onCancel,
  // Обрабатываем конструкцию: onConfirm.
  onConfirm,
  // Закрываем текущий блок.
}: ClearLogsDialogProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open={open} onClose={onCancel} title={t(logs.c….
  return (
    // Обрабатываем конструкцию: <Modal open={open} onClose={onCancel} title={t(logs.cle….
    <Modal
      // Обрабатываем конструкцию: open.
      open={open}
      // Обрабатываем конструкцию: onClose.
      onClose={onCancel}
      // Обрабатываем конструкцию: title.
      title={t("logs.clearDialog.title")}
      // Обрабатываем конструкцию: description.
      description={t("logs.clearDialog.description", { count: totalCount })}
      // Обрабатываем конструкцию: size.
      size="sm"
      // Обрабатываем конструкцию: footer.
      footer={
        // Обрабатываем конструкцию: <>.
        <>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button variant="ghost" onClick={onCancel}>
            {/* Выводим текстовое содержимое в JSX. */}
            {t("common.cancel")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button variant="danger" onClick={onConfirm}>
            {/* Выводим текстовое содержимое в JSX. */}
            {t("logs.clear")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </>
        // Закрываем текущий блок.
      }
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="text-text-secondary flex items-start gap-3 text-sm">
        {/* Выводим текстовое содержимое в JSX. */}
        <AlertTriangle
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="text-accent-danger mt-0.5 size-5 shrink-0"
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <span>{t("logs.clearDialog.body")}</span>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default ClearLogsDialog;.
export default ClearLogsDialog;
// — разделитель логических блоков —
