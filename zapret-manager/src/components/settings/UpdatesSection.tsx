// Импортируем зависимости из модуля react.
import { useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { RefreshCw, ShieldOff, X } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/updates/BackupHistory.
import BackupHistory from "@/components/updates/BackupHistory";
// Импортируем зависимости из модуля @/components/settings/SettingRow.
import SettingRow from "@/components/settings/SettingRow";
// Импортируем зависимости из модуля @/components/ui.
import { Badge, Button, Card, Input, Text, Toggle } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useUpdater.
import { useUpdater } from "@/hooks/useUpdater";
// Импортируем зависимости из модуля @/lib/updateUtils.
import { formatVersion, isValidRepo } from "@/lib/updateUtils";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useUpdateStore.
import { useUpdateStore } from "@/stores/useUpdateStore";
// Импортируем зависимости из модуля @/types.
import type { StrategyUpdateSettings } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию UpdatesSection.
function UpdatesSection() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const settings = useSettingsStore((state) => state.sett….
  const settings = useSettingsStore((state) => state.settings.strategyUpdates);
  // Обрабатываем конструкцию: const patch = useSettingsStore((state) => state.updateS….
  const patch = useSettingsStore((state) => state.updateStrategyUpdates);
  // Обрабатываем конструкцию: const info = useUpdateStore((state) => state.info).
  const info = useUpdateStore((state) => state.info);
  // Обрабатываем конструкцию: const status = useUpdateStore((state) => state.status).
  const status = useUpdateStore((state) => state.status);
  // Обрабатываем конструкцию: const { check, openModal } = useUpdater().
  const { check, openModal } = useUpdater();
  // Обрабатываем конструкцию: const [repoError, setRepoError] = useState<string | nul….
  const [repoError, setRepoError] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const patchSetting = <K extends keyof StrategyUpdateSet….
  const patchSetting = <K extends keyof StrategyUpdateSettings>(
    // Обрабатываем конструкцию: key.
    key: K,
    // Обрабатываем конструкцию: value.
    value: StrategyUpdateSettings[K]
    // Закрываем выражение или список аргументов.
  ): void => {
    // Обрабатываем конструкцию: patch.
    patch({ [key]: value } as Partial<StrategyUpdateSettings>);
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleRepoBlur = (): void => { setRepoError( isVa….
  const handleRepoBlur = (): void => {
    // Обрабатываем конструкцию: setRepoError.
    setRepoError(
      // Обрабатываем конструкцию: isValidRepo.
      isValidRepo(settings.githubRepo)
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          null
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          t("settings.updates.repoInvalid")
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Card className=flex flex-col gap-5 padding=lg> <div ….
  return (
    // Обрабатываем конструкцию: <Card className=flex flex-col gap-5 padding=lg>.
    <Card className="flex flex-col gap-5" padding="lg">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-1">
        {/* Выводим текстовое содержимое в JSX. */}
        <h2 className="text-text-primary text-lg font-semibold">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.title")}
          {/* Выводим текстовое содержимое в JSX. */}
        </h2>
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="body" size="sm" className="text-text-secondary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.description")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="text-text-secondary flex flex-wrap items-center gap-3 text-sm">
        {/* Выводим текстовое содержимое в JSX. */}
        <span>
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.current")}:{" "}
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="text-text-primary font-mono">
            {/* Выводим текстовое содержимое в JSX. */}
            {formatVersion(info?.currentVersion ?? "unknown")}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        {info !== null ? (
          // Обрабатываем конструкцию: <Badge variant={info.available ? accent : neutral}>.
          <Badge variant={info.available ? "accent" : "neutral"}>
            {/* Выводим текстовое содержимое в JSX. */}
            {info.available
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("settings.updates.availableVersion", {
                  // Обрабатываем конструкцию: version.
                  version: info.latestVersion,
                  // Закрываем текущий блок.
                })
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("settings.updates.currentVersion", {
                  // Обрабатываем конструкцию: version.
                  version: info.latestVersion,
                  // Закрываем текущий блок.
                })}
            {/* Выводим текстовое содержимое в JSX. */}
          </Badge>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
        {status === "checking" ? (
          // Обрабатываем конструкцию: <Badge variant=neutral>.
          <Badge variant="neutral">{t("settings.updates.checking")}</Badge>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-1">
        {/* Выводим текстовое содержимое в JSX. */}
        <SettingRow
          // Обрабатываем конструкцию: label.
          label={t("settings.updates.autoCheck")}
          // Обрабатываем конструкцию: description.
          description={t("settings.updates.autoCheckHint")}
          // Обрабатываем конструкцию: control.
          control={
            // Рендерим самозакрывающийся элемент Toggle.
            <Toggle
              // Обрабатываем конструкцию: ariaLabel.
              ariaLabel={t("settings.updates.autoCheck")}
              // Обрабатываем конструкцию: checked.
              checked={settings.autoCheck}
              // Обрабатываем конструкцию: onChange.
              onChange={(value) => {
                // Обрабатываем конструкцию: patchSetting.
                patchSetting("autoCheck", value);
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            />
            // Закрываем текущий блок.
          }
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: variant.
          variant="secondary"
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: void check().
            void check();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.checkNow")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: onClick.
          onClick={openModal}
          // Обрабатываем конструкцию: disabled.
          disabled={info === null}
          // Обрабатываем конструкцию: icon.
          icon={<ShieldOff aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.details")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-1">
        {/* Выводим текстовое содержимое в JSX. */}
        <Input
          // Задаём атрибут data-focus-quiet элемента.
          data-focus-quiet
          // Обрабатываем конструкцию: label.
          label={t("settings.updates.repo")}
          // Обрабатываем конструкцию: value.
          value={settings.githubRepo}
          // Обрабатываем конструкцию: error.
          error={repoError !== null}
          // Обрабатываем конструкцию: errorMessage.
          errorMessage={repoError ?? undefined}
          // Обрабатываем конструкцию: placeholder.
          placeholder="Flowseal/zapret-discord-youtube"
          // Обрабатываем конструкцию: onChange.
          onChange={(event) => {
            // Обрабатываем конструкцию: patchSetting.
            patchSetting("githubRepo", event.target.value);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onBlur.
          onBlur={handleRepoBlur}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="caption" size="sm" className="text-text-tertiary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.repoHint")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-1">
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="body" size="sm" className="text-text-secondary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.versionAutoBefore")}{" "}
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="font-mono">.version</span>{" "}
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.versionAutoMiddle")}{" "}
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="font-mono">service.bat</span>
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.versionAutoAfter")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {settings.ignoredVersions.length > 0 ? (
        // Обрабатываем конструкцию: <div className=flex flex-col gap-2>.
        <div className="flex flex-col gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="body" size="sm" className="text-text-secondary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.updates.ignored")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
          <div className="flex flex-wrap gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            {settings.ignoredVersions.map((version) => (
              // Обрабатываем конструкцию: <button key={version} type=button onClick={() => { patc….
              <button
                // Обрабатываем конструкцию: key.
                key={version}
                // Обрабатываем конструкцию: type.
                type="button"
                // Обрабатываем конструкцию: onClick.
                onClick={() => {
                  // Обрабатываем конструкцию: patchSetting.
                  patchSetting(
                    // Обрабатываем конструкцию: ignoredVersions.
                    "ignoredVersions",
                    // Обрабатываем конструкцию: settings.
                    settings.ignoredVersions.filter((item) => item !== version)
                    // Закрываем выражение или список аргументов.
                  );
                  // Закрываем текущий блок.
                }}
                // Обрабатываем конструкцию: className.
                className="text-text-secondary hover:text-text-primary border-glass-border bg-glass-bg flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors"
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {version}
                {/* Выводим текстовое содержимое в JSX. */}
                <X aria-hidden="true" className="size-3" />
                {/* Выводим текстовое содержимое в JSX. */}
              </button>
              // Закрываем выражение или список аргументов.
            ))}
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="body" size="sm" className="text-text-secondary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.updates.history")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
        <BackupHistory />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Card>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default UpdatesSection;.
export default UpdatesSection;
// — разделитель логических блоков —
