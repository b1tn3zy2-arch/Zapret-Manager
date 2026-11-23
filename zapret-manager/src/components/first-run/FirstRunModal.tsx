// Импортируем зависимости из модуля react.
import type { ReactNode } from "react";
// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import {
  // Подключаем именованный импорт Check.
  Check,
  // Подключаем именованный импорт FileCode2.
  FileCode2,
  // Подключаем именованный импорт ListChecks.
  ListChecks,
  // Подключаем именованный импорт Rocket.
  Rocket,
  // Подключаем именованный импорт ShieldCheck.
  ShieldCheck,
  // Закрываем текущий блок.
} from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/components/ui/Modal.
import Modal from "@/components/ui/Modal";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/constants.
import { APP_NAME } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/resources.
import { formatResourceVersion } from "@/lib/resources";
// Импортируем зависимости из модуля @/types.
import type { InitReport } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface FirstRunModalProps {
  // Обрабатываем конструкцию: open.
  open: boolean;
  // Обрабатываем конструкцию: report.
  report: InitReport | null;
  // Обрабатываем конструкцию: onStart.
  onStart: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ENTRY_TRANSITION = { duration: 0.4, ease: [0.16, ….
const ENTRY_TRANSITION = { duration: 0.4, ease: [0.16, 1, 0.3, 1] } as const;
// — разделитель логических блоков —

// Объявляем функцию FirstRunModal.
function FirstRunModal({ open, report, onStart }: FirstRunModalProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const strategies = report?.strategiesCount ?? 0.
  const strategies = report?.strategiesCount ?? 0;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open={open} onClose={onStart} title={t(setting….
  return (
    // Обрабатываем конструкцию: <Modal open={open} onClose={onStart} title={t(settings.….
    <Modal
      // Обрабатываем конструкцию: open.
      open={open}
      // Обрабатываем конструкцию: onClose.
      onClose={onStart}
      // Обрабатываем конструкцию: title.
      title={t("settings.resources.welcomeTitle")}
      // Обрабатываем конструкцию: description.
      description={t("settings.resources.welcomeBody")}
      // Обрабатываем конструкцию: size.
      size="md"
      // Обрабатываем конструкцию: closeOnBackdrop.
      closeOnBackdrop={false}
      // Обрабатываем конструкцию: closeOnEscape.
      closeOnEscape={false}
      // Обрабатываем конструкцию: footer.
      footer={
        // Обрабатываем конструкцию: <Button size=lg onClick={onStart}>.
        <Button size="lg" onClick={onStart}>
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.resources.welcomeAction")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        // Закрываем текущий блок.
      }
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col items-center gap-6">
        {/* Выводим текстовое содержимое в JSX. */}
        <motion.div
          // Обрабатываем конструкцию: initial.
          initial={{ opacity: 0, scale: 0.85 }}
          // Обрабатываем конструкцию: animate.
          animate={{ opacity: 1, scale: 1 }}
          // Обрабатываем конструкцию: transition.
          transition={ENTRY_TRANSITION}
          // Обрабатываем конструкцию: className.
          className="bg-accent-primary/15 flex size-20 items-center justify-center rounded-2xl"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <Rocket
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: className.
            className="text-accent-primary size-9"
            // Обрабатываем конструкцию: strokeWidth.
            strokeWidth={2}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
        </motion.div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <ul className="flex w-full flex-col gap-3">
          {/* Выводим текстовое содержимое в JSX. */}
          <Entry
            // Обрабатываем конструкцию: icon.
            icon={<ListChecks className="size-4" strokeWidth={2} />}
            // Обрабатываем конструкцию: label.
            label={t("settings.resources.welcomeStrategies").replace(
              // Обрабатываем конструкцию: {count}.
              "{count}",
              // Обрабатываем конструкцию: String.
              String(strategies)
              // Закрываем выражение или список аргументов.
            )}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <Entry
            // Обрабатываем конструкцию: icon.
            icon={<FileCode2 className="size-4" strokeWidth={2} />}
            // Обрабатываем конструкцию: label.
            label={t("settings.resources.welcomeEngine")}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <Entry
            // Обрабатываем конструкцию: icon.
            icon={<Check className="size-4" strokeWidth={2} />}
            // Обрабатываем конструкцию: label.
            label={t("settings.resources.welcomeConfigs")}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          {report?.vpnCoreIncluded ? (
            // Рендерим самозакрывающийся элемент Entry.
            <Entry
              // Обрабатываем конструкцию: icon.
              icon={<ShieldCheck className="size-4" strokeWidth={2} />}
              // Обрабатываем конструкцию: label.
              label={t("settings.resources.welcomeVpnCore")}
              // Продолжаем выражение.
            />
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* Выводим текстовое содержимое в JSX. */}
        </ul>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="caption" size="sm" className="text-text-tertiary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.resources.welcomeVersion").replace(
            // Обрабатываем конструкцию: {version}.
            "{version}",
            // Обрабатываем конструкцию: formatResourceVersion.
            formatResourceVersion(report?.resourcesVersion ?? "", t)
            // Закрываем выражение или список аргументов.
          ) + ` · ${APP_NAME}`}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию Entry.
function Entry({ icon, label }: { icon: ReactNode; label: string }) {
  // Возвращаем результат: ( <li className=border-glass-border bg-glass-bg flex it….
  return (
    // Обрабатываем конструкцию: <li className=border-glass-border bg-glass-bg flex item….
    <li className="border-glass-border bg-glass-bg flex items-center gap-3 rounded-lg border px-3 py-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-accent-primary shrink-0">{icon}</span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-primary text-sm">{label}</span>
      {/* Выводим текстовое содержимое в JSX. */}
      <Check
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className="text-accent-primary ml-auto size-4 shrink-0"
        // Обрабатываем конструкцию: strokeWidth.
        strokeWidth={2.5}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </li>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default FirstRunModal;.
export default FirstRunModal;
// — разделитель логических блоков —
