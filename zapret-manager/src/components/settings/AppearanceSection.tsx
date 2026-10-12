import Dropdown from "@/components/settings/Dropdown";
import SectionContainer from "@/components/settings/SectionContainer";
import SettingRow from "@/components/settings/SettingRow";
import Toggle from "@/components/ui/Toggle";
import { Slider } from "@/components/ui";
import { useMemo } from "react";

import { useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import {
  ANIMATION_SPEED_MAX,
  ANIMATION_SPEED_MIN,
  ANIMATION_SPEED_STEP,
  INTERFACE_SCALE_MAX,
  INTERFACE_SCALE_MIN,
  INTERFACE_SCALE_STEP,
} from "@/lib/appearanceTokens";
import { DEFAULT_APPEARANCE, DEFAULT_POST_PROCESSING } from "@/lib/defaults";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type {
  EffectIntensity,
  PostProcessingQuality,
  ThemeMode,
} from "@/types";

const THEME_OPTIONS = [
  { value: "dark", labelKey: "settings.appearance.values.dark" },
  { value: "light", labelKey: "settings.appearance.values.light" },
  { value: "auto", labelKey: "settings.appearance.values.auto" },
] as const satisfies readonly {
  value: ThemeMode;
  labelKey: TranslationKey;
  disabled?: boolean;
}[];

const INTENSITY_OPTIONS = [
  { value: "off", labelKey: "settings.appearance.values.off" },
  { value: "subtle", labelKey: "settings.appearance.values.subtle" },
  { value: "normal", labelKey: "settings.appearance.values.normal" },
  { value: "strong", labelKey: "settings.appearance.values.strong" },
] as const satisfies readonly {
  value: EffectIntensity;
  labelKey: TranslationKey;
}[];

const QUALITY_OPTIONS = [
  { value: "low", labelKey: "settings.appearance.values.low" },
  { value: "medium", labelKey: "settings.appearance.values.medium" },
  { value: "high", labelKey: "settings.appearance.values.high" },
] as const satisfies readonly {
  value: PostProcessingQuality;
  labelKey: TranslationKey;
}[];

function AppearanceSection() {
  const { t } = useI18n();
  const appearance = useSettingsStore((state) => state.settings.appearance);
  const updateAppearance = useSettingsStore((state) => state.updateAppearance);
  const updatePostProcessing = useSettingsStore(
    (state) => state.updatePostProcessing
  );
  const effects = appearance.postProcessing;

  const themeOptions = useMemo(
    () =>
      THEME_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t]
  );

  const intensityOptions = useMemo(
    () =>
      INTENSITY_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t]
  );

  const qualityOptions = useMemo(
    () =>
      QUALITY_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t]
  );

  return (
    <>
      <SectionContainer
        title={t("settings.appearance.title")}
        description={t("settings.appearance.description")}
        onReset={() => {
          updateAppearance(DEFAULT_APPEARANCE);
        }}
        resetLabel={t("settings.common.resetSection")}
      >
        <SettingRow
          label={t("settings.appearance.theme")}
          control={
            <Dropdown
              label={t("settings.appearance.theme")}
              value={appearance.theme}
              options={themeOptions}
              onChange={(theme) => {
                updateAppearance({ theme });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.interfaceScale")}
          description={t("settings.appearance.interfaceScaleHint")}
          control={
            <Slider
              className="w-56"
              value={appearance.interfaceScale}
              min={INTERFACE_SCALE_MIN}
              max={INTERFACE_SCALE_MAX}
              step={INTERFACE_SCALE_STEP}
              ariaLabel={t("settings.appearance.interfaceScale")}
              formatValue={(value) => `${value}%`}
              onChange={(interfaceScale) => {
                updateAppearance({ interfaceScale });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.animationSpeed")}
          description={t("settings.appearance.animationSpeedHint")}
          control={
            <Slider
              className="w-56"
              value={appearance.animationSpeed}
              min={ANIMATION_SPEED_MIN}
              max={ANIMATION_SPEED_MAX}
              step={ANIMATION_SPEED_STEP}
              ariaLabel={t("settings.appearance.animationSpeed")}
              formatValue={(value) => `${value}%`}
              onChange={(animationSpeed) => {
                updateAppearance({ animationSpeed });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.animations")}
          description={t("settings.appearance.animationsHint")}
          control={
            <Toggle
              ariaLabel={t("settings.appearance.animations")}
              checked={appearance.animations}
              onChange={(animations) => {
                updateAppearance({ animations });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.trayIcon")}
          control={
            <Toggle
              ariaLabel={t("settings.appearance.trayIcon")}
              checked={appearance.animateTrayIcon}
              onChange={(animateTrayIcon) => {
                updateAppearance({ animateTrayIcon });
              }}
            />
          }
        />
      </SectionContainer>

      <SectionContainer
        title={t("settings.appearance.postProcessing")}
        description={t("settings.appearance.postProcessingHint")}
        onReset={() => {
          updatePostProcessing(DEFAULT_POST_PROCESSING);
        }}
        resetLabel={t("settings.common.resetSection")}
      >
        <SettingRow
          label={t("settings.appearance.bloom")}
          description={t("settings.appearance.bloomHint")}
          control={
            <Dropdown
              label={t("settings.appearance.bloom")}
              value={effects.bloom}
              options={intensityOptions}
              onChange={(bloom) => {
                updatePostProcessing({ bloom });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.vignette")}
          description={t("settings.appearance.vignetteHint")}
          control={
            <Dropdown
              label={t("settings.appearance.vignette")}
              value={effects.vignette}
              options={intensityOptions}
              onChange={(vignette) => {
                updatePostProcessing({ vignette });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.filmGrain")}
          description={t("settings.appearance.filmGrainHint")}
          control={
            <Toggle
              ariaLabel={t("settings.appearance.filmGrain")}
              checked={effects.filmGrain}
              onChange={(filmGrain) => {
                updatePostProcessing({ filmGrain });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.scanlines")}
          description={t("settings.appearance.scanlinesHint")}
          control={
            <Toggle
              ariaLabel={t("settings.appearance.scanlines")}
              checked={effects.scanlines}
              onChange={(scanlines) => {
                updatePostProcessing({ scanlines });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.chromatic")}
          description={t("settings.appearance.chromaticHint")}
          control={
            <Toggle
              ariaLabel={t("settings.appearance.chromatic")}
              checked={effects.chromaticAberration}
              onChange={(chromaticAberration) => {
                updatePostProcessing({ chromaticAberration });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.motionBlur")}
          description={t("settings.appearance.motionBlurHint")}
          control={
            <Toggle
              ariaLabel={t("settings.appearance.motionBlur")}
              checked={effects.motionBlur}
              onChange={(motionBlur) => {
                updatePostProcessing({ motionBlur });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.quality")}
          description={t("settings.appearance.qualityHint")}
          control={
            <Dropdown
              label={t("settings.appearance.quality")}
              value={effects.globalQuality}
              options={qualityOptions}
              onChange={(globalQuality) => {
                updatePostProcessing({ globalQuality });
              }}
            />
          }
        />
      </SectionContainer>
    </>
  );
}

export default AppearanceSection;
