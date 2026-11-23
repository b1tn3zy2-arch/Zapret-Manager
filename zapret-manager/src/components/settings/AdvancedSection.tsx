// Импортируем зависимости из модуля react.
import { useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { AlertTriangle } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/DangerZone.
import DangerZone from "@/components/settings/DangerZone";
// Импортируем зависимости из модуля @/components/settings/EditableList.
import EditableList from "@/components/settings/EditableList";
// Импортируем зависимости из модуля @/components/settings/LogRetentionField.
import LogRetentionField from "@/components/settings/LogRetentionField";
// Импортируем зависимости из модуля @/components/settings/ResourcesSection.
import ResourcesSection from "@/components/settings/ResourcesSection";
// Импортируем зависимости из модуля @/components/settings/SectionContainer.
import SectionContainer from "@/components/settings/SectionContainer";
// Импортируем зависимости из модуля @/components/settings/SettingRow.
import SettingRow from "@/components/settings/SettingRow";
// Импортируем зависимости из модуля @/components/ui.
import { Button, Text, Toggle } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/settingsSchema.
import {
  // Подключаем именованный импорт MAX_LOG_RETENTION_DAYS.
  MAX_LOG_RETENTION_DAYS,
  // Подключаем именованный импорт MIN_LOG_RETENTION_DAYS.
  MIN_LOG_RETENTION_DAYS,
  // Закрываем текущий блок.
} from "@/lib/settingsSchema";
// Импортируем зависимости из модуля @/hooks/useSystemInfo.
import { verifyConfigs } from "@/hooks/useSystemInfo";
// Импортируем зависимости из модуля @/lib/utils.
import { cn, toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { ConfigCheckReport } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию ReportText.
function ReportText({ report }: { report: ConfigCheckReport }) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const problems = report.emptyFiles.length + report.dupl….
  const problems =
    // Обрабатываем конструкцию: report.
    report.emptyFiles.length + report.duplicates.length + report.invalid.length;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: problems === 0.
  if (problems === 0) {
    // Возвращаем результат: ( <Text variant=body size=sm className=text-accent-prim….
    return (
      // Обрабатываем конструкцию: <Text variant=body size=sm className=text-accent-primar….
      <Text variant="body" size="sm" className="text-accent-primary">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("settings.advanced.verifyOk", { checked: report.checked })}
        {/* Выводим текстовое содержимое в JSX. */}
      </Text>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col gap-1> <Text variant=bod….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-1>.
    <div className="flex flex-col gap-1">
      {/* Выводим текстовое содержимое в JSX. */}
      <Text variant="body" size="sm" className="text-text-secondary">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("settings.advanced.verifyProblems", {
          // Обрабатываем конструкцию: checked.
          checked: report.checked,
          // Передаём поле problems в объект.
          problems,
          // Закрываем текущий блок.
        })}
        {/* Выводим текстовое содержимое в JSX. */}
      </Text>
      {/* Выводим текстовое содержимое в JSX. */}
      {report.emptyFiles.length > 0 ? (
        // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-accent-dan….
        <Text variant="caption" size="sm" className="text-accent-danger">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.advanced.verifyEmptyFiles", {
            // Обрабатываем конструкцию: list.
            list: report.emptyFiles.join(", "),
            // Закрываем текущий блок.
          })}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
      {report.duplicates.length > 0 ? (
        // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-accent-war….
        <Text variant="caption" size="sm" className="text-accent-warning">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.advanced.verifyDuplicates", {
            // Обрабатываем конструкцию: list.
            list: report.duplicates.slice(0, 8).join(", "),
            // Закрываем текущий блок.
          })}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
      {report.invalid.length > 0 ? (
        // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-accent-dan….
        <Text variant="caption" size="sm" className="text-accent-danger">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.advanced.verifyInvalid", {
            // Обрабатываем конструкцию: list.
            list: report.invalid.slice(0, 8).join(", "),
            // Закрываем текущий блок.
          })}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию AdvancedSection.
function AdvancedSection() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const advanced = useSettingsStore((state) => state.sett….
  const advanced = useSettingsStore((state) => state.settings.advanced);
  // Обрабатываем конструкцию: const updateAdvanced = useSettingsStore((state) => stat….
  const updateAdvanced = useSettingsStore((state) => state.updateAdvanced);
  // Обрабатываем конструкцию: const folder = useSettingsStore((state) => state.settin….
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [report, setReport] = useState<ConfigCheckReport ….
  const [report, setReport] = useState<ConfigCheckReport | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const runVerify = async (): Promise<void> => { if (fold….
  const runVerify = async (): Promise<void> => {
    // Проверяем бизнес-условие: folder ===.
    if (folder === "") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: setReport.
      setReport(await verifyConfigs(folder));
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: t("settings.common.verifyFailed", {
          // Обрабатываем конструкцию: error.
          error: toErrorMessage(caught),
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <SectionContainer title={t(settings.advanced.title)} ….
  return (
    // Обрабатываем конструкцию: <SectionContainer title={t(settings.advanced.title)} de….
    <SectionContainer
      // Обрабатываем конструкцию: title.
      title={t("settings.advanced.title")}
      // Обрабатываем конструкцию: description.
      description={t("settings.advanced.description")}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.advanced.engine.title")}
        // Обрабатываем конструкцию: description.
        description={t("settings.advanced.engine.description")}
        // Обрабатываем конструкцию: control.
        control={
          // Обрабатываем конструкцию: <div role=radiogroup aria-label={t(settings.advanced.en….
          <div
            // Обрабатываем конструкцию: role.
            role="radiogroup"
            // Обрабатываем конструкцию: aria-label.
            aria-label={t("settings.advanced.engine.title")}
            // Обрабатываем конструкцию: className.
            className="flex items-center gap-2"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {(["auto", "native", "legacy"] as const).map((value) => {
              // Обрабатываем конструкцию: const active = advanced.strategyEngine === value.
              const active = advanced.strategyEngine === value;
              // — разделитель логических блоков —

              // Возвращаем результат: ( <button key={value} type=button role=radio aria-check….
              return (
                // Обрабатываем конструкцию: <button key={value} type=button role=radio aria-checked….
                <button
                  // Обрабатываем конструкцию: key.
                  key={value}
                  // Обрабатываем конструкцию: type.
                  type="button"
                  // Обрабатываем конструкцию: role.
                  role="radio"
                  // Обрабатываем конструкцию: aria-checked.
                  aria-checked={active}
                  // Обрабатываем конструкцию: onClick.
                  onClick={() => {
                    // Обрабатываем конструкцию: updateAdvanced.
                    updateAdvanced({ strategyEngine: value });
                    // Закрываем текущий блок.
                  }}
                  // Обрабатываем конструкцию: className.
                  className={cn(
                    // Обрабатываем конструкцию: rounded-full border px-3 py-1.5 text-xs font-medium tra….
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    // Обрабатываем конструкцию: active.
                    active
                      ? // Обрабатываем конструкцию: ?.
                        // Продолжаем предыдущую конструкцию.
                        "border-accent-primary/40 bg-accent-primary/10 text-accent-primary"
                      : // Обрабатываем конструкцию: :.
                        // Продолжаем предыдущую конструкцию.
                        "border-glass-border text-text-secondary hover:text-text-primary"
                    // Закрываем выражение или список аргументов.
                  )}
                  // Продолжаем выражение.
                >
                  {/* Выводим текстовое содержимое в JSX. */}
                  {t(
                    // Обрабатываем конструкцию: value.
                    value === "auto"
                      ? // Обрабатываем конструкцию: ?.
                        // Продолжаем предыдущую конструкцию.
                        "settings.advanced.engine.auto"
                      : // Обрабатываем конструкцию: :.
                        // Продолжаем предыдущую конструкцию.
                        value === "native"
                        ? // Обрабатываем конструкцию: ?.
                          // Продолжаем предыдущую конструкцию.
                          "settings.advanced.engine.native"
                        : // Обрабатываем конструкцию: :.
                          // Продолжаем предыдущую конструкцию.
                          "settings.advanced.engine.legacy"
                    // Закрываем выражение или список аргументов.
                  )}
                  {/* Выводим текстовое содержимое в JSX. */}
                </button>
                // Закрываем выражение или список аргументов.
              );
              // Закрываем текущий блок.
            })}
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.advanced.logRetention")}
        // Обрабатываем конструкцию: description.
        description={t("settings.advanced.logRetentionHint", {
          // Обрабатываем конструкцию: min.
          min: MIN_LOG_RETENTION_DAYS,
          // Обрабатываем конструкцию: max.
          max: MAX_LOG_RETENTION_DAYS,
          // Закрываем текущий блок.
        })}
        // Обрабатываем конструкцию: control.
        control={<LogRetentionField />}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="py-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <EditableList
          // Обрабатываем конструкцию: items.
          items={advanced.winwsExtraArgs}
          // Обрабатываем конструкцию: onChange.
          onChange={(winwsExtraArgs) => {
            // Обрабатываем конструкцию: updateAdvanced.
            updateAdvanced({ winwsExtraArgs });
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: label.
          label={t("settings.advanced.extraArgs")}
          // Обрабатываем конструкцию: placeholder.
          placeholder="--dpi-desync=fake"
          // Обрабатываем конструкцию: addLabel.
          addLabel={t("settings.advanced.addArgument")}
          // Обрабатываем конструкцию: emptyMessage.
          emptyMessage={t("settings.advanced.noArgs")}
          // Обрабатываем конструкцию: hint.
          hint={t("settings.advanced.extraArgsHint")}
          // Обрабатываем конструкцию: validate.
          validate={
            // Продолжаем предыдущую конструкцию.
            (value) =>
              // Обрабатываем конструкцию: value.
              value !== "" && value.startsWith(" ")
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  t("settings.advanced.leadingSpace")
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  null
            // Закрываем текущий блок.
          }
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.advanced.disableUpdate")}
        // Обрабатываем конструкцию: description.
        description={t("settings.advanced.disableUpdateHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.advanced.disableUpdate")}
            // Обрабатываем конструкцию: checked.
            checked={advanced.disableUpdateCheck}
            // Обрабатываем конструкцию: onChange.
            onChange={(disableUpdateCheck) => {
              // Обрабатываем конструкцию: updateAdvanced.
              updateAdvanced({ disableUpdateCheck });
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-3 py-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="secondary"
          // Обрабатываем конструкцию: disabled.
          disabled={folder === ""}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: void runVerify().
            void runVerify();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<AlertTriangle aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.advanced.verify")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
        {report !== null ? <ReportText report={report} /> : null}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <ResourcesSection />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <DangerZone />
      {/* Выводим текстовое содержимое в JSX. */}
    </SectionContainer>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default AdvancedSection;.
export default AdvancedSection;
// — разделитель логических блоков —
