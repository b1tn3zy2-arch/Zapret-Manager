// Импортируем зависимости из модуля @/components/ui/Dropdown.
import Dropdown from "@/components/ui/Dropdown";
// Импортируем зависимости из модуля @/components/settings/SectionContainer.
import SectionContainer from "@/components/settings/SectionContainer";
// Импортируем зависимости из модуля @/components/settings/SettingRow.
import SettingRow from "@/components/settings/SettingRow";
// Импортируем зависимости из модуля @/components/ui/Toggle.
import Toggle from "@/components/ui/Toggle";
// Импортируем зависимости из модуля @/components/ui.
import { Slider } from "@/components/ui";
// Импортируем зависимости из модуля react.
import { useMemo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/appearanceTokens.
import {
  // Подключаем именованный импорт ANIMATION_SPEED_MAX.
  ANIMATION_SPEED_MAX,
  // Подключаем именованный импорт ANIMATION_SPEED_MIN.
  ANIMATION_SPEED_MIN,
  // Подключаем именованный импорт ANIMATION_SPEED_STEP.
  ANIMATION_SPEED_STEP,
  // Подключаем именованный импорт INTERFACE_SCALE_MAX.
  INTERFACE_SCALE_MAX,
  // Подключаем именованный импорт INTERFACE_SCALE_MIN.
  INTERFACE_SCALE_MIN,
  // Подключаем именованный импорт INTERFACE_SCALE_STEP.
  INTERFACE_SCALE_STEP,
  // Закрываем текущий блок.
} from "@/lib/appearanceTokens";
// Импортируем зависимости из модуля @/lib/defaults.
import { DEFAULT_APPEARANCE } from "@/lib/defaults";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { ThemeMode } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const THEME_OPTIONS = [ { value: dark, labelKey: settin….
const THEME_OPTIONS = [
  // Открываем объектный литерал.
  { value: "dark", labelKey: "settings.appearance.values.dark" },
  // Открываем объектный литерал.
  { value: "light", labelKey: "settings.appearance.values.light" },
  // Открываем объектный литерал.
  { value: "auto", labelKey: "settings.appearance.values.auto" },
  // Закрываем массив или список.
] as const satisfies readonly {
  // Обрабатываем конструкцию: value.
  value: ThemeMode;
  // Обрабатываем конструкцию: labelKey.
  labelKey: TranslationKey;
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Закрываем текущий блок.
}[];
// — разделитель логических блоков —

// Объявляем функцию AppearanceSection.
function AppearanceSection() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const appearance = useSettingsStore((state) => state.se….
  const appearance = useSettingsStore((state) => state.settings.appearance);
  // Обрабатываем конструкцию: const updateAppearance = useSettingsStore((state) => st….
  const updateAppearance = useSettingsStore((state) => state.updateAppearance);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const themeOptions = useMemo( () => THEME_OPTIONS.map((….
  const themeOptions = useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () =>
      // Обрабатываем конструкцию: THEME_OPTIONS.
      THEME_OPTIONS.map((option) => ({
        // Обрабатываем конструкцию: value.
        value: option.value,
        // Обрабатываем конструкцию: label.
        label: t(option.labelKey),
        // Закрываем текущий блок.
      })),
    // Открываем массив.
    [t]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: ( <SectionContainer title={t(settings.appearance.title)….
  return (
    // Обрабатываем конструкцию: <SectionContainer title={t(settings.appearance.title)} ….
    <SectionContainer
      // Обрабатываем конструкцию: title.
      title={t("settings.appearance.title")}
      // Обрабатываем конструкцию: description.
      description={t("settings.appearance.description")}
      // Обрабатываем конструкцию: onReset.
      onReset={() => {
        // Обрабатываем конструкцию: updateAppearance.
        updateAppearance(DEFAULT_APPEARANCE);
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: resetLabel.
      resetLabel={t("settings.common.resetSection")}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.appearance.theme")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Dropdown.
          <Dropdown
            // Обрабатываем конструкцию: label.
            label={t("settings.appearance.theme")}
            // Обрабатываем конструкцию: value.
            value={appearance.theme}
            // Обрабатываем конструкцию: options.
            options={themeOptions}
            // Обрабатываем конструкцию: onChange.
            onChange={(theme) => {
              // Обрабатываем конструкцию: updateAppearance.
              updateAppearance({ theme });
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
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.appearance.interfaceScale")}
        // Обрабатываем конструкцию: description.
        description={t("settings.appearance.interfaceScaleHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Slider.
          <Slider
            // Обрабатываем конструкцию: className.
            className="w-56"
            // Обрабатываем конструкцию: value.
            value={appearance.interfaceScale}
            // Обрабатываем конструкцию: min.
            min={INTERFACE_SCALE_MIN}
            // Обрабатываем конструкцию: max.
            max={INTERFACE_SCALE_MAX}
            // Обрабатываем конструкцию: step.
            step={INTERFACE_SCALE_STEP}
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.appearance.interfaceScale")}
            // Обрабатываем конструкцию: formatValue.
            formatValue={(value) => `${value}%`}
            // Обрабатываем конструкцию: onChange.
            onChange={(interfaceScale) => {
              // Обрабатываем конструкцию: updateAppearance.
              updateAppearance({ interfaceScale });
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
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.appearance.animationSpeed")}
        // Обрабатываем конструкцию: description.
        description={t("settings.appearance.animationSpeedHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Slider.
          <Slider
            // Обрабатываем конструкцию: className.
            className="w-56"
            // Обрабатываем конструкцию: value.
            value={appearance.animationSpeed}
            // Обрабатываем конструкцию: min.
            min={ANIMATION_SPEED_MIN}
            // Обрабатываем конструкцию: max.
            max={ANIMATION_SPEED_MAX}
            // Обрабатываем конструкцию: step.
            step={ANIMATION_SPEED_STEP}
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.appearance.animationSpeed")}
            // Обрабатываем конструкцию: formatValue.
            formatValue={(value) => `${value}%`}
            // Обрабатываем конструкцию: onChange.
            onChange={(animationSpeed) => {
              // Обрабатываем конструкцию: updateAppearance.
              updateAppearance({ animationSpeed });
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
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.appearance.animations")}
        // Обрабатываем конструкцию: description.
        description={t("settings.appearance.animationsHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.appearance.animations")}
            // Обрабатываем конструкцию: checked.
            checked={appearance.animations}
            // Обрабатываем конструкцию: onChange.
            onChange={(animations) => {
              // Обрабатываем конструкцию: updateAppearance.
              updateAppearance({ animations });
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
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.appearance.trayIcon")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.appearance.trayIcon")}
            // Обрабатываем конструкцию: checked.
            checked={appearance.animateTrayIcon}
            // Обрабатываем конструкцию: onChange.
            onChange={(animateTrayIcon) => {
              // Обрабатываем конструкцию: updateAppearance.
              updateAppearance({ animateTrayIcon });
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </SectionContainer>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default AppearanceSection;.
export default AppearanceSection;
// — разделитель логических блоков —
