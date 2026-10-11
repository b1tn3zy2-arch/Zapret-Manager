import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

import { useEffect, useMemo, useState } from "react";

import Dropdown from "@/components/settings/Dropdown";
import SectionContainer from "@/components/settings/SectionContainer";
import SettingRow from "@/components/settings/SettingRow";
import Toggle from "@/components/ui/Toggle";
import { useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { Language } from "@/types";

const LANGUAGE_OPTIONS = [
  { value: "ru", labelKey: "settings.general.languageRu" },
  { value: "en", labelKey: "settings.general.languageEn" },
] as const satisfies readonly { value: Language; labelKey: TranslationKey }[];

function GeneralSection() {
  const { t } = useI18n();
  const general = useSettingsStore((state) => state.settings.general);
  const updateGeneral = useSettingsStore((state) => state.updateGeneral);
  const addLog = useLogsStore((state) => state.addLog);

  const languageOptions = useMemo(
    () =>
      LANGUAGE_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t]
  );

  const [autoStart, setAutoStart] = useState(general.autoStart);
  const [autoStartBusy, setAutoStartBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void isEnabled()
      .then((value) => {
        if (!cancelled) {
          setAutoStart(value);
          if (value !== general.autoStart) {
            updateGeneral({ autoStart: value });
          }
        }
      })
      .catch(() => {
        return;
      });

    return () => {
      cancelled = true;
    };
  }, [general.autoStart, updateGeneral]);

  const changeAutoStart = async (value: boolean): Promise<void> => {
    setAutoStartBusy(true);

    try {
      if (value) {
        await enable();
      } else {
        await disable();
      }

      setAutoStart(value);
      updateGeneral({ autoStart: value });
      addLog({
        level: "info",
        source: "user",
        message: value
          ? t("settings.general.autoStartOn")
          : t("settings.general.autoStartOff"),
      });
    } catch (caught) {
      const message = toErrorMessage(caught);
      setAutoStart(!value);
      addLog({
        level: "error",
        source: "user",
        message: t("settings.general.autoStartFailed", { error: message }),
      });
    } finally {
      setAutoStartBusy(false);
    }
  };

  return (
    <SectionContainer
      title={t("settings.general.title")}
      description={t("settings.general.description")}
      onReset={() => {
        updateGeneral({
          language: "ru",
          autoStart: false,
          minimizeToTray: true,
          startMinimized: false,
          showNotifications: true,
        });
      }}
      resetLabel={t("settings.common.resetSection")}
    >
      <SettingRow
        label={t("settings.general.language")}
        description={t("settings.general.languageHint")}
        control={
          <Dropdown
            label={t("settings.general.language")}
            value={general.language}
            options={languageOptions}
            onChange={(language) => {
              updateGeneral({ language });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.general.autoStart")}
        description={t("settings.general.autoStartHint")}
        disabled={autoStartBusy}
        control={
          <Toggle
            ariaLabel={t("settings.general.autoStart")}
            checked={autoStart}
            disabled={autoStartBusy}
            onChange={(value) => {
              void changeAutoStart(value);
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.general.minimizeToTray")}
        control={
          <Toggle
            ariaLabel={t("settings.general.minimizeToTray")}
            checked={general.minimizeToTray}
            onChange={(value) => {
              updateGeneral({ minimizeToTray: value });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.general.startMinimized")}
        control={
          <Toggle
            ariaLabel={t("settings.general.startMinimized")}
            checked={general.startMinimized}
            onChange={(value) => {
              updateGeneral({ startMinimized: value });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.general.notifyOnStart")}
        description={t("settings.general.notifyOnStartHint")}
        control={
          <Toggle
            ariaLabel={t("settings.general.notifyOnStart")}
            checked={general.showNotificationsOnStart}
            disabled={!general.showNotifications}
            onChange={(value) => {
              updateGeneral({ showNotificationsOnStart: value });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.general.notifyOnStop")}
        description={t("settings.general.notifyOnStopHint")}
        control={
          <Toggle
            ariaLabel={t("settings.general.notifyOnStop")}
            checked={general.showNotificationsOnStop}
            disabled={!general.showNotifications}
            onChange={(value) => {
              updateGeneral({ showNotificationsOnStop: value });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.general.notifyOnUpdate")}
        description={t("settings.general.notifyOnUpdateHint")}
        control={
          <Toggle
            ariaLabel={t("settings.general.notifyOnUpdate")}
            checked={general.showUpdateNotifications}
            disabled={!general.showNotifications}
            onChange={(value) => {
              updateGeneral({ showUpdateNotifications: value });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.general.showNotifications")}
        description={t("settings.general.showNotificationsHint")}
        control={
          <Toggle
            ariaLabel={t("settings.general.showNotifications")}
            checked={general.showNotifications}
            onChange={(value) => {
              updateGeneral({ showNotifications: value });
            }}
          />
        }
      />
    </SectionContainer>
  );
}

export default GeneralSection;
