// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Shield } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Text } from "@/components/ui";
// Импортируем зависимости из модуля @/components/ui/Modal.
import Modal from "@/components/ui/Modal";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/resources.
import { formatBytesForResources, stageLabel } from "@/lib/resources";
// Импортируем зависимости из модуля @/lib/constants.
import { ANIMATION } from "@/lib/constants";
// Импортируем зависимости из модуля @/types.
import type { InitProgress } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface InitProgressModalProps {
  // Обрабатываем конструкцию: open.
  open: boolean;
  // Обрабатываем конструкцию: progress.
  progress: InitProgress | null;
  // Обрабатываем конструкцию: extractedBytes.
  extractedBytes: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию InitProgressModal.
function InitProgressModal({
  // Обрабатываем конструкцию: open.
  open,
  // Обрабатываем конструкцию: progress.
  progress,
  // Обрабатываем конструкцию: extractedBytes.
  extractedBytes,
  // Закрываем текущий блок.
}: InitProgressModalProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const percent = progress?.percent ?? 0.
  const percent = progress?.percent ?? 0;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open={open} onClose={() => undefined} title={t….
  return (
    // Обрабатываем конструкцию: <Modal open={open} onClose={() => undefined} title={t(s….
    <Modal
      // Обрабатываем конструкцию: open.
      open={open}
      // Обрабатываем конструкцию: onClose.
      onClose={() => undefined}
      // Обрабатываем конструкцию: title.
      title={t("settings.resources.firstRunTitle")}
      // Обрабатываем конструкцию: description.
      description={t("settings.resources.firstRunHint")}
      // Обрабатываем конструкцию: size.
      size="sm"
      // Обрабатываем конструкцию: closeOnBackdrop.
      closeOnBackdrop={false}
      // Обрабатываем конструкцию: closeOnEscape.
      closeOnEscape={false}
      // Обрабатываем конструкцию: showCloseButton.
      showCloseButton={false}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-4">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-col gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="label" className="text-text-primary">
            {/* Выводим текстовое содержимое в JSX. */}
            {stageLabel(progress?.stage ?? "idle", t)}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="caption" size="sm" className="text-text-tertiary">
            {/* Выводим текстовое содержимое в JSX. */}
            {progress?.currentFile ?? t("settings.resources.stageIdle")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div
          // Обрабатываем конструкцию: role.
          role="progressbar"
          // Обрабатываем конструкцию: aria-valuemin.
          aria-valuemin={0}
          // Обрабатываем конструкцию: aria-valuemax.
          aria-valuemax={100}
          // Обрабатываем конструкцию: aria-valuenow.
          aria-valuenow={percent}
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("settings.resources.progressAriaLabel")}
          // Обрабатываем конструкцию: className.
          className="bg-glass-hover h-2 w-full overflow-hidden rounded-full"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <motion.div
            // Обрабатываем конструкцию: className.
            className="bg-accent-primary h-full rounded-full"
            // Обрабатываем конструкцию: initial.
            initial={{ width: "0%" }}
            // Обрабатываем конструкцию: animate.
            animate={{ width: `${percent}%` }}
            // Обрабатываем конструкцию: transition.
            transition={{ duration: ANIMATION.normal, ease: "easeOut" }}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex items-center justify-between gap-3">
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="caption" size="sm" className="text-text-tertiary">
            {/* Выводим текстовое содержимое в JSX. */}
            {formatBytesForResources(extractedBytes)}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="text-text-primary text-2xl font-bold tabular-nums">
            {/* Выводим текстовое содержимое в JSX. */}
            {percent}%{/* Обрабатываем конструкцию: </span>. */}
            {/* Продолжаем предыдущую конструкцию. */}
          </span>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="text-text-tertiary flex items-center gap-2 text-xs">
          {/* Выводим текстовое содержимое в JSX. */}
          <Shield aria-hidden="true" className="size-3.5" strokeWidth={2} />
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.resources.firstRunDoNotClose")}
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default InitProgressModal;.
export default InitProgressModal;
// — разделитель логических блоков —
