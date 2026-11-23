// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля lucide-react.
import { FolderOpen, Play, Square, X } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button } from "@/components/ui";
// Импортируем зависимости из модуля @/lib/format.
import { formatFileSize, formatRelativeTime } from "@/lib/format";
// Импортируем зависимости из модуля @/lib/format.
import { capitalizeService } from "@/lib/format";
// Импортируем зависимости из модуля @/types.
import type { Strategy } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyCardBackProps {
  // Обрабатываем конструкцию: strategy.
  strategy: Strategy;
  // Обрабатываем конструкцию: isRunning.
  isRunning: boolean;
  // Обрабатываем конструкцию: isBusy.
  isBusy: boolean;
  // Обрабатываем конструкцию: onRun.
  onRun: () => void;
  // Обрабатываем конструкцию: onStop.
  onStop: () => void;
  // Обрабатываем конструкцию: onOpenFolder.
  onOpenFolder: () => void;
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FILE_TYPE_LABELS = { winws: winws, goodbye-dpi: g….
const FILE_TYPE_LABELS = {
  // Обрабатываем конструкцию: winws.
  winws: "winws",
  // Обрабатываем конструкцию: goodbye-dpi.
  "goodbye-dpi": "goodbye-dpi",
  // Обрабатываем конструкцию: zapret.
  zapret: "zapret",
  // Обрабатываем конструкцию: unknown.
  unknown: "common.unknown",
  // Закрываем текущий блок.
} as const satisfies Record<Strategy["fileType"], string>;
// — разделитель логических блоков —

// Объявляем функцию StrategyCardBack.
function StrategyCardBack({
  // Обрабатываем конструкцию: strategy.
  strategy,
  // Обрабатываем конструкцию: isRunning.
  isRunning,
  // Обрабатываем конструкцию: isBusy.
  isBusy,
  // Обрабатываем конструкцию: onRun.
  onRun,
  // Обрабатываем конструкцию: onStop.
  onStop,
  // Обрабатываем конструкцию: onOpenFolder.
  onOpenFolder,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Закрываем текущий блок.
}: StrategyCardBackProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Возвращаем результат: ( <div className=flex h-full flex-col gap-3 p-4 text-le….
  return (
    // Обрабатываем конструкцию: <div className=flex h-full flex-col gap-3 p-4 text-left….
    <div className="flex h-full flex-col gap-3 p-4 text-left">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-1">
        {/* Выводим текстовое содержимое в JSX. */}
        <h3 className="text-text-primary text-base leading-tight font-bold">
          {/* Выводим текстовое содержимое в JSX. */}
          {strategy.name}
          {/* Выводим текстовое содержимое в JSX. */}
        </h3>
        {/* Выводим текстовое содержимое в JSX. */}
        <p className="text-text-tertiary truncate font-mono text-[10px]">
          {/* Выводим текстовое содержимое в JSX. */}
          {strategy.filename}
          {/* Выводим текстовое содержимое в JSX. */}
        </p>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <p className="text-text-secondary line-clamp-4 min-h-0 flex-1 scrollbar-thin overflow-y-auto text-xs leading-relaxed">
        {/* Выводим текстовое содержимое в JSX. */}
        {strategy.description}
        {/* Выводим текстовое содержимое в JSX. */}
      </p>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <dl className="text-text-tertiary grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
        {/* Выводим текстовое содержимое в JSX. */}
        <dt>{t("strategies.card.type")}</dt>
        {/* Выводим текстовое содержимое в JSX. */}
        <dd className="text-text-secondary truncate text-right">
          {/* Выводим текстовое содержимое в JSX. */}
          {strategy.fileType === "unknown"
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t(FILE_TYPE_LABELS.unknown)
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              FILE_TYPE_LABELS[strategy.fileType]}
          {/* Выводим текстовое содержимое в JSX. */}
        </dd>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <dt>{t("strategies.card.size")}</dt>
        {/* Выводим текстовое содержимое в JSX. */}
        <dd className="text-text-secondary text-right">
          {/* Выводим текстовое содержимое в JSX. */}
          {formatFileSize(strategy.size)}
          {/* Выводим текстовое содержимое в JSX. */}
        </dd>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <dt>{t("strategies.card.changed")}</dt>
        {/* Выводим текстовое содержимое в JSX. */}
        <dd className="text-text-secondary truncate text-right">
          {/* Выводим текстовое содержимое в JSX. */}
          {strategy.modifiedAt === undefined || strategy.modifiedAt === null
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              "—"
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              formatRelativeTime(strategy.modifiedAt)}
          {/* Выводим текстовое содержимое в JSX. */}
        </dd>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <dt>{t("strategies.card.services")}</dt>
        {/* Выводим текстовое содержимое в JSX. */}
        <dd className="text-text-secondary truncate text-right">
          {/* Выводим текстовое содержимое в JSX. */}
          {strategy.services.map(capitalizeService).join(", ") || "—"}
          {/* Выводим текстовое содержимое в JSX. */}
        </dd>
        {/* Выводим текстовое содержимое в JSX. */}
      </dl>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <p
        // Обрабатываем конструкцию: className.
        className="text-text-tertiary truncate font-mono text-[9px]"
        // Обрабатываем конструкцию: title.
        title={strategy.path}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {strategy.path}
        {/* Выводим текстовое содержимое в JSX. */}
      </p>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-1.5">
        {/* Выводим текстовое содержимое в JSX. */}
        {isRunning ? (
          // Обрабатываем конструкцию: <Button size=sm variant=danger disabled={isBusy} onClic….
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="danger"
            // Обрабатываем конструкцию: disabled.
            disabled={isBusy}
            // Обрабатываем конструкцию: onClick.
            onClick={onStop}
            // Обрабатываем конструкцию: icon.
            icon={<Square aria-hidden="true" className="size-3.5" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("strategies.card.stop")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
        ) : (
          // Продолжаем предыдущую конструкцию.
          // Закрываем выражение или список аргументов.
          // Обрабатываем конструкцию: <Button size=sm disabled={isBusy} onClick={onRun} icon=….
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: disabled.
            disabled={isBusy}
            // Обрабатываем конструкцию: onClick.
            onClick={onRun}
            // Обрабатываем конструкцию: icon.
            icon={<Play aria-hidden="true" className="size-3.5" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("strategies.card.run")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          // Закрываем выражение или список аргументов.
        )}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex gap-1.5">
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="secondary"
            // Обрабатываем конструкцию: className.
            className="flex-1"
            // Обрабатываем конструкцию: onClick.
            onClick={onOpenFolder}
            // Обрабатываем конструкцию: icon.
            icon={<FolderOpen aria-hidden="true" className="size-3.5" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("strategies.card.folder")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="ghost"
            // Обрабатываем конструкцию: aria-label.
            aria-label={t("strategies.card.closeAria")}
            // Обрабатываем конструкцию: title.
            title={t("strategies.card.closeTitle")}
            // Обрабатываем конструкцию: onClick.
            onClick={onClose}
            // Обрабатываем конструкцию: icon.
            icon={<X aria-hidden="true" className="size-3.5" />}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default StrategyCardBack;.
export default StrategyCardBack;
// — разделитель логических блоков —
