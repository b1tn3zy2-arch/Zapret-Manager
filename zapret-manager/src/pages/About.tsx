// Импортируем зависимости из модуля react.
import { lazy, Suspense, useCallback, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/about/AboutActions.
import AboutActions from "@/components/about/AboutActions";
// Импортируем зависимости из модуля @/components/about/AboutIdentity.
import AboutIdentity from "@/components/about/AboutIdentity";
// Импортируем зависимости из модуля @/components/about/AboutSystemCard.
import AboutSystemCard from "@/components/about/AboutSystemCard";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useCopyToClipboard.
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
// Импортируем зависимости из модуля @/hooks/useSystemInfo.
import { openFolder, useSystemInfo } from "@/hooks/useSystemInfo";
// Импортируем зависимости из модуля @/hooks/useUpdater.
import { useUpdater } from "@/hooks/useUpdater";
// Импортируем зависимости из модуля @/hooks/useResourceInit.
import { useResourceInit } from "@/hooks/useResourceInit";
// Импортируем зависимости из модуля @/lib/resources.
import { formatResourceVersion } from "@/lib/resources";
// Импортируем зависимости из модуля @/lib/systemInfo.
import { formatSystemInfo } from "@/lib/systemInfo";
// Импортируем зависимости из модуля @/lib/updateUtils.
import { formatVersion } from "@/lib/updateUtils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LicensesModal = lazy( async () => await import(@/….
const LicensesModal = lazy(
  // Обрабатываем конструкцию: async.
  async () => await import("@/components/settings/LicensesModal")
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Объявляем псевдоним типа OpenFolderKind.
type OpenFolderKind = "logs" | "config" | "strategies";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function About() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { info } = useSystemInfo().
  const { info } = useSystemInfo();
  // Обрабатываем конструкцию: const { check } = useUpdater().
  const { check } = useUpdater();
  // Обрабатываем конструкцию: const { copy, copied } = useCopyToClipboard(2500).
  const { copy, copied } = useCopyToClipboard(2500);
  // Обрабатываем конструкцию: const logs = useLogsStore((state) => state.logs).
  const logs = useLogsStore((state) => state.logs);
  // Обрабатываем конструкцию: const strategies = useStrategiesStore((state) => state.….
  const strategies = useStrategiesStore((state) => state.strategies);
  // Обрабатываем конструкцию: const folder = useSettingsStore((state) => state.settin….
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  // Обрабатываем конструкцию: const [licensesOpen, setLicensesOpen] = useState(false).
  const [licensesOpen, setLicensesOpen] = useState(false);
  // Обрабатываем конструкцию: const { version: resourcesVersion } = useResourceInit().
  const { version: resourcesVersion } = useResourceInit();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleOpenFolder = useCallback( (kind: OpenFolder….
  const handleOpenFolder = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (kind: OpenFolderKind): void => {
      // Обрабатываем конструкцию: void openFolder(kind, folder).catch(() => undefined).
      void openFolder(kind, folder).catch(() => undefined);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [folder]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleCopyInfo = useCallback((): void => { if (in….
  const handleCopyInfo = useCallback((): void => {
    // Проверяем бизнес-условие: info !== null.
    if (info !== null) {
      // Обрабатываем конструкцию: void copy(formatSystemInfo(info, logs, strategies)).
      void copy(formatSystemInfo(info, logs, strategies));
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [copy, info, logs, strategies]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const resourcesLabel = t(settings.resources.welcomeVers….
  const resourcesLabel = t("settings.resources.welcomeVersion")
    // Продолжаем цепочку вызовов.
    .replace("{version}", "")
    // Продолжаем цепочку вызовов.
    .trim();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col gap-6 pb-8> <AboutIdenti….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-6 pb-8>.
    <div className="flex flex-col gap-6 pb-8">
      {/* Выводим текстовое содержимое в JSX. */}
      <AboutIdentity
        // Обрабатываем конструкцию: appVersion.
        appVersion={formatVersion(info?.appVersion ?? "0.0.0")}
        // Обрабатываем конструкцию: resourcesVersion.
        resourcesVersion={formatResourceVersion(resourcesVersion, t)}
        // Обрабатываем конструкцию: resourcesLabel.
        resourcesLabel={resourcesLabel}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <AboutSystemCard info={info} t={t} />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <AboutActions
        // Обрабатываем конструкцию: canOpenStrategies.
        canOpenStrategies={folder !== ""}
        // Обрабатываем конструкцию: canCopyInfo.
        canCopyInfo={info !== null}
        // Обрабатываем конструкцию: copied.
        copied={copied}
        // Обрабатываем конструкцию: onCheckUpdates.
        onCheckUpdates={() => {
          // Обрабатываем конструкцию: void check().
          void check();
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onOpenFolder.
        onOpenFolder={handleOpenFolder}
        // Обрабатываем конструкцию: onOpenLicenses.
        onOpenLicenses={() => {
          // Обрабатываем конструкцию: setLicensesOpen.
          setLicensesOpen(true);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onCopyInfo.
        onCopyInfo={handleCopyInfo}
        // Обрабатываем конструкцию: t.
        t={t}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Suspense fallback={null}>
        {/* Выводим текстовое содержимое в JSX. */}
        <LicensesModal
          // Обрабатываем конструкцию: open.
          open={licensesOpen}
          // Обрабатываем конструкцию: onClose.
          onClose={() => {
            // Обрабатываем конструкцию: setLicensesOpen.
            setLicensesOpen(false);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </Suspense>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
