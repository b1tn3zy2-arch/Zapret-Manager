import { Suspense, lazy } from "react";
import { CheckCircle2, Download, RotateCcw } from "lucide-react";

import UpdateProgressBar from "@/components/updates/UpdateProgress";
import { Badge, Button, Modal } from "@/components/ui";
import { useI18n } from "@/i18n";
import { formatBytes } from "@/lib/trafficUtils";
import { formatReleaseDate, formatVersion } from "@/lib/updateUtils";
import { useUpdateStore } from "@/stores/useUpdateStore";

const ChangelogRenderer = lazy(
  async () => await import("@/components/updates/ChangelogRenderer")
);

function ChangelogFallback() {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-glass-bg h-4 w-3/4 animate-pulse rounded" />
      <div className="bg-glass-bg h-4 w-full animate-pulse rounded" />
      <div className="bg-glass-bg h-4 w-2/3 animate-pulse rounded" />
    </div>
  );
}

export interface UpdateModalProps {
  onDownload: () => void;
  onInstall: () => void;
  onCancel: () => void;
  onDismiss: () => void;
  onIgnore: () => void;
  onClose: () => void;
  onRetry: () => void;
}

function UpdateModal({
  onDownload,
  onInstall,
  onCancel,
  onDismiss,
  onIgnore,
  onClose,
  onRetry,
}: UpdateModalProps) {
  const { t } = useI18n();
  const isOpen = useUpdateStore((state) => state.isModalOpen);
  const status = useUpdateStore((state) => state.status);
  const info = useUpdateStore((state) => state.info);
  const progress = useUpdateStore((state) => state.progress);
  const error = useUpdateStore((state) => state.error);
  const report = useUpdateStore((state) => state.report);

  const isBusy = status === "downloading" || status === "installing";
  const isReady = status === "ready";
  const isDownloaded = status === "downloaded";

  const title = isReady
    ? t("updates.titleInstalled")
    : status === "error"
      ? t("updates.titleFailed")
      : info?.available === true
        ? t("updates.titleAvailable")
        : t("updates.titleUpToDate");

  const footer = isReady ? (
    <Button variant="primary" onClick={onClose}>
      {t("updates.done")}
    </Button>
  ) : isBusy ? (
    <>
      <Button variant="ghost" onClick={onDismiss}>
        {t("updates.hide")}
      </Button>
      {status === "downloading" ? (
        <Button
          variant="danger"
          onClick={onCancel}
          icon={<RotateCcw size={14} />}
        >
          {t("updates.cancel")}
        </Button>
      ) : null}
    </>
  ) : (
    <>
      <Button variant="ghost" onClick={onDismiss}>
        {t("updates.later")}
      </Button>
      <Button variant="ghost" onClick={onIgnore}>
        {t("updates.ignore")}
      </Button>
      {status === "error" ? (
        <Button variant="primary" onClick={onRetry}>
          {t("updates.retry")}
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={isDownloaded ? onInstall : onDownload}
          icon={<Download size={14} />}
        >
          {isDownloaded ? t("updates.install") : t("updates.download")}
        </Button>
      )}
    </>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      closeOnBackdrop={!isBusy}
      footer={footer}
    >
      {info === null ? (
        <p className="text-text-secondary text-sm">{t("updates.checking")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-text-tertiary font-mono text-sm">
              {formatVersion(info.currentVersion)}
            </span>
            <span className="text-text-tertiary" aria-hidden="true">
              →
            </span>
            <span className="text-accent-primary font-mono text-lg font-bold">
              {formatVersion(info.latestVersion)}
            </span>
            {info.ignored ? (
              <Badge variant="neutral">{t("updates.ignoredBadge")}</Badge>
            ) : null}
            {info.size > 0 ? (
              <span className="text-text-tertiary ml-auto text-xs">
                {formatBytes(info.size)} · {formatReleaseDate(info.publishedAt)}
              </span>
            ) : (
              <span className="text-accent-danger ml-auto text-xs">
                {t("updates.noZip")}
              </span>
            )}
          </div>

          {isReady && report !== null ? (
            <div className="text-text-secondary flex items-center gap-2 text-sm">
              <CheckCircle2
                aria-hidden="true"
                className="text-accent-primary size-4"
              />
              {t("updates.filesUpdated", { count: report.files })}
              {report.preservedEntries > 0
                ? ` ${t("updates.preserved", { count: report.preservedEntries })}`
                : ""}
              {report.checkUpdatesDisabled ? t("updates.zapretUpdaterOff") : ""}
            </div>
          ) : null}

          {status === "error" ? (
            <p className="text-accent-danger text-sm">
              {error !== null && error !== ""
                ? error
                : t("updates.unknownError")}
            </p>
          ) : null}

          {status === "downloading" && progress !== null ? (
            <UpdateProgressBar progress={progress} />
          ) : null}

          {isDownloaded ? (
            <p className="text-text-secondary text-sm">
              {t("updates.downloadedHint")}
            </p>
          ) : null}

          {status === "installing" ? (
            <p className="text-text-secondary text-sm">
              {t("updates.installingHint")}
            </p>
          ) : null}

          {isReady ? null : (
            <Suspense fallback={<ChangelogFallback />}>
              <ChangelogRenderer markdown={info.releaseNotes} />
            </Suspense>
          )}
        </div>
      )}
    </Modal>
  );
}

export default UpdateModal;
