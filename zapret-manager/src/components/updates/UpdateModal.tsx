// Импортируем зависимости из модуля react.
import { Suspense, lazy } from "react";
// Импортируем зависимости из модуля lucide-react.
import { CheckCircle2, Download, RotateCcw } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/updates/UpdateProgress.
import UpdateProgressBar from "@/components/updates/UpdateProgress";
// Импортируем зависимости из модуля @/components/ui.
import { Badge, Button, Modal } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/trafficUtils.
import { formatBytes } from "@/lib/trafficUtils";
// Импортируем зависимости из модуля @/lib/updateUtils.
import { formatReleaseDate, formatVersion } from "@/lib/updateUtils";
// Импортируем зависимости из модуля @/stores/useUpdateStore.
import { useUpdateStore } from "@/stores/useUpdateStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ChangelogRenderer = lazy( async () => await impor….
const ChangelogRenderer = lazy(
  // Обрабатываем конструкцию: async.
  async () => await import("@/components/updates/ChangelogRenderer")
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Объявляем функцию ChangelogFallback.
function ChangelogFallback() {
  // Возвращаем результат: ( <div className=flex flex-col gap-2> <div className=bg….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-2>.
    <div className="flex flex-col gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="bg-glass-bg h-4 w-3/4 animate-pulse rounded" />
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="bg-glass-bg h-4 w-full animate-pulse rounded" />
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="bg-glass-bg h-4 w-2/3 animate-pulse rounded" />
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UpdateModalProps {
  // Обрабатываем конструкцию: onDownload.
  onDownload: () => void;
  // Обрабатываем конструкцию: onInstall.
  onInstall: () => void;
  // Обрабатываем конструкцию: onCancel.
  onCancel: () => void;
  // Обрабатываем конструкцию: onDismiss.
  onDismiss: () => void;
  // Обрабатываем конструкцию: onIgnore.
  onIgnore: () => void;
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Обрабатываем конструкцию: onRetry.
  onRetry: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию UpdateModal.
function UpdateModal({
  // Обрабатываем конструкцию: onDownload.
  onDownload,
  // Обрабатываем конструкцию: onInstall.
  onInstall,
  // Обрабатываем конструкцию: onCancel.
  onCancel,
  // Обрабатываем конструкцию: onDismiss.
  onDismiss,
  // Обрабатываем конструкцию: onIgnore.
  onIgnore,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Обрабатываем конструкцию: onRetry.
  onRetry,
  // Закрываем текущий блок.
}: UpdateModalProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const isOpen = useUpdateStore((state) => state.isModalO….
  const isOpen = useUpdateStore((state) => state.isModalOpen);
  // Обрабатываем конструкцию: const status = useUpdateStore((state) => state.status).
  const status = useUpdateStore((state) => state.status);
  // Обрабатываем конструкцию: const info = useUpdateStore((state) => state.info).
  const info = useUpdateStore((state) => state.info);
  // Обрабатываем конструкцию: const progress = useUpdateStore((state) => state.progre….
  const progress = useUpdateStore((state) => state.progress);
  // Обрабатываем конструкцию: const error = useUpdateStore((state) => state.error).
  const error = useUpdateStore((state) => state.error);
  // Обрабатываем конструкцию: const report = useUpdateStore((state) => state.report).
  const report = useUpdateStore((state) => state.report);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const isBusy = status === downloading || status === ins….
  const isBusy = status === "downloading" || status === "installing";
  // Обрабатываем конструкцию: const isReady = status === ready.
  const isReady = status === "ready";
  // Обрабатываем конструкцию: const isDownloaded = status === downloaded.
  const isDownloaded = status === "downloaded";
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const title = isReady ? t(updates.titleInstalled) : sta….
  const title = isReady
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      t("updates.titleInstalled")
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      status === "error"
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        t("updates.titleFailed")
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        info?.available === true
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          t("updates.titleAvailable")
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          t("updates.titleUpToDate");
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const footer = isReady ? ( <Button variant=primary onCl….
  const footer = isReady ? (
    // Обрабатываем конструкцию: <Button variant=primary onClick={onClose}>.
    <Button variant="primary" onClick={onClose}>
      {/* Выводим текстовое содержимое в JSX. */}
      {t("updates.done")}
      {/* Выводим текстовое содержимое в JSX. */}
    </Button>
  ) : // Закрываем выражение или список аргументов.
  // Продолжаем предыдущую конструкцию.
  isBusy ? (
    // Обрабатываем конструкцию: <>.
    <>
      {/* Выводим текстовое содержимое в JSX. */}
      <Button variant="ghost" onClick={onDismiss}>
        {/* Выводим текстовое содержимое в JSX. */}
        {t("updates.hide")}
        {/* Выводим текстовое содержимое в JSX. */}
      </Button>
      {/* Выводим текстовое содержимое в JSX. */}
      {status === "downloading" ? (
        // Обрабатываем конструкцию: <Button variant=danger onClick={onCancel} icon={<Rotate….
        <Button
          // Обрабатываем конструкцию: variant.
          variant="danger"
          // Обрабатываем конструкцию: onClick.
          onClick={onCancel}
          // Обрабатываем конструкцию: icon.
          icon={<RotateCcw size={14} />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("updates.cancel")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </>
  ) : (
    // Продолжаем предыдущую конструкцию.
    // Закрываем выражение или список аргументов.
    // Обрабатываем конструкцию: <>.
    <>
      {/* Выводим текстовое содержимое в JSX. */}
      <Button variant="ghost" onClick={onDismiss}>
        {/* Выводим текстовое содержимое в JSX. */}
        {t("updates.later")}
        {/* Выводим текстовое содержимое в JSX. */}
      </Button>
      {/* Выводим текстовое содержимое в JSX. */}
      <Button variant="ghost" onClick={onIgnore}>
        {/* Выводим текстовое содержимое в JSX. */}
        {t("updates.ignore")}
        {/* Выводим текстовое содержимое в JSX. */}
      </Button>
      {/* Выводим текстовое содержимое в JSX. */}
      {status === "error" ? (
        // Обрабатываем конструкцию: <Button variant=primary onClick={onRetry}>.
        <Button variant="primary" onClick={onRetry}>
          {/* Выводим текстовое содержимое в JSX. */}
          {t("updates.retry")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
      ) : (
        // Продолжаем предыдущую конструкцию.
        // Закрываем выражение или список аргументов.
        // Обрабатываем конструкцию: <Button variant=primary onClick={isDownloaded ? onInsta….
        <Button
          // Обрабатываем конструкцию: variant.
          variant="primary"
          // Обрабатываем конструкцию: onClick.
          onClick={isDownloaded ? onInstall : onDownload}
          // Обрабатываем конструкцию: icon.
          icon={<Download size={14} />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {isDownloaded ? t("updates.install") : t("updates.download")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </>
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open={isOpen} onClose={onClose} title={title} ….
  return (
    // Обрабатываем конструкцию: <Modal open={isOpen} onClose={onClose} title={title} si….
    <Modal
      // Обрабатываем конструкцию: open.
      open={isOpen}
      // Обрабатываем конструкцию: onClose.
      onClose={onClose}
      // Обрабатываем конструкцию: title.
      title={title}
      // Обрабатываем конструкцию: size.
      size="lg"
      // Обрабатываем конструкцию: closeOnBackdrop.
      closeOnBackdrop={!isBusy}
      // Обрабатываем конструкцию: footer.
      footer={footer}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {info === null ? (
        // Обрабатываем конструкцию: <p className=text-text-secondary text-sm>.
        <p className="text-text-secondary text-sm">{t("updates.checking")}</p>
      ) : (
        // Продолжаем предыдущую конструкцию.
        // Закрываем выражение или список аргументов.
        // Обрабатываем конструкцию: <div className=flex flex-col gap-4>.
        <div className="flex flex-col gap-4">
          {/* Выводим текстовое содержимое в JSX. */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Выводим текстовое содержимое в JSX. */}
            <span className="text-text-tertiary font-mono text-sm">
              {/* Выводим текстовое содержимое в JSX. */}
              {formatVersion(info.currentVersion)}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
            {/* Выводим текстовое содержимое в JSX. */}
            <span className="text-text-tertiary" aria-hidden="true">
              {/* Выводим текстовое содержимое в JSX. */}→
              {/* Обрабатываем конструкцию: </span>. */}
            </span>
            {/* Выводим текстовое содержимое в JSX. */}
            <span className="text-accent-primary font-mono text-lg font-bold">
              {/* Выводим текстовое содержимое в JSX. */}
              {formatVersion(info.latestVersion)}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
            {/* Выводим текстовое содержимое в JSX. */}
            {info.ignored ? (
              // Обрабатываем конструкцию: <Badge variant=neutral>.
              <Badge variant="neutral">{t("updates.ignoredBadge")}</Badge>
            ) : // Закрываем выражение или список аргументов.
            // Продолжаем предыдущую конструкцию.
            null}
            {/* Выводим текстовое содержимое в JSX. */}
            {info.size > 0 ? (
              // Обрабатываем конструкцию: <span className=text-text-tertiary ml-auto text-xs>.
              <span className="text-text-tertiary ml-auto text-xs">
                {/* Выводим текстовое содержимое в JSX. */}
                {formatBytes(info.size)} · {formatReleaseDate(info.publishedAt)}
                {/* Выводим текстовое содержимое в JSX. */}
              </span>
            ) : (
              // Продолжаем предыдущую конструкцию.
              // Закрываем выражение или список аргументов.
              // Обрабатываем конструкцию: <span className=text-accent-danger ml-auto text-xs>.
              <span className="text-accent-danger ml-auto text-xs">
                {/* Выводим текстовое содержимое в JSX. */}
                {t("updates.noZip")}
                {/* Выводим текстовое содержимое в JSX. */}
              </span>
              // Закрываем выражение или список аргументов.
            )}
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {isReady && report !== null ? (
            // Обрабатываем конструкцию: <div className=text-text-secondary flex items-center ga….
            <div className="text-text-secondary flex items-center gap-2 text-sm">
              {/* Выводим текстовое содержимое в JSX. */}
              <CheckCircle2
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="text-accent-primary size-4"
                // Продолжаем выражение.
              />
              {/* Выводим текстовое содержимое в JSX. */}
              {t("updates.filesUpdated", { count: report.files })}
              {/* Выводим текстовое содержимое в JSX. */}
              {report.preservedEntries > 0
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  ` ${t("updates.preserved", { count: report.preservedEntries })}`
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  ""}
              {/* Выводим текстовое содержимое в JSX. */}
              {report.checkUpdatesDisabled ? t("updates.zapretUpdaterOff") : ""}
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {status === "error" ? (
            // Обрабатываем конструкцию: <p className=text-accent-danger text-sm>.
            <p className="text-accent-danger text-sm">
              {/* Выводим текстовое содержимое в JSX. */}
              {error !== null && error !== ""
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  error
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  t("updates.unknownError")}
              {/* Выводим текстовое содержимое в JSX. */}
            </p>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {status === "downloading" && progress !== null ? (
            // Рендерим самозакрывающийся элемент UpdateProgressBar.
            <UpdateProgressBar progress={progress} />
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {isDownloaded ? (
            // Обрабатываем конструкцию: <p className=text-text-secondary text-sm>.
            <p className="text-text-secondary text-sm">
              {/* Выводим текстовое содержимое в JSX. */}
              {t("updates.downloadedHint")}
              {/* Выводим текстовое содержимое в JSX. */}
            </p>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {status === "installing" ? (
            // Обрабатываем конструкцию: <p className=text-text-secondary text-sm>.
            <p className="text-text-secondary text-sm">
              {/* Выводим текстовое содержимое в JSX. */}
              {t("updates.installingHint")}
              {/* Выводим текстовое содержимое в JSX. */}
            </p>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {isReady ? null : (
            // Обрабатываем конструкцию: <div className=max-h-52 overflow-y-auto pr-1>.
            <div className="max-h-52 overflow-y-auto pr-1">
              {/* Выводим текстовое содержимое в JSX. */}
              <Suspense fallback={<ChangelogFallback />}>
                {/* Выводим текстовое содержимое в JSX. */}
                <ChangelogRenderer markdown={info.releaseNotes} />
                {/* Выводим текстовое содержимое в JSX. */}
              </Suspense>
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
            // Закрываем выражение или список аргументов.
          )}
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default UpdateModal;.
export default UpdateModal;
// — разделитель логических блоков —
