import Dropdown from "@/components/settings/Dropdown";
import SectionContainer from "@/components/settings/SectionContainer";
import SettingRow from "@/components/settings/SettingRow";
import Toggle from "@/components/ui/Toggle";
import { useI18n } from "@/i18n";
import { DEFAULT_APPEARANCE, DEFAULT_POST_PROCESSING } from "@/lib/defaults";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type {
  DensityMode,
  EffectIntensity,
  PostProcessingQuality,
  ThemeMode,
} from "@/types";

const THEME_OPTIONS = [
  { value: "dark", label: "Тёмная" },
  { value: "light", label: "Светлая" },
  { value: "auto", label: "Как в системе" },
] as const satisfies readonly {
  value: ThemeMode;
  label: string;
  disabled?: boolean;
}[];

const DENSITY_OPTIONS = [
  { value: "compact", label: "Плотно" },
  { value: "normal", label: "Обычно" },
  { value: "comfy", label: "Просторно" },
] as const satisfies readonly { value: DensityMode; label: string }[];

const INTENSITY_OPTIONS = [
  { value: "off", label: "Выкл" },
  { value: "subtle", label: "Едва заметно" },
  { value: "normal", label: "Обычно" },
  { value: "strong", label: "Сильно" },
] as const satisfies readonly { value: EffectIntensity; label: string }[];

const QUALITY_OPTIONS = [
  { value: "low", label: "Низкое" },
  { value: "medium", label: "Среднее" },
  { value: "high", label: "Высокое" },
] as const satisfies readonly {
  value: PostProcessingQuality;
  label: string;
}[];

function AppearanceSection() {
  const { t } = useI18n();
  const appearance = useSettingsStore((state) => state.settings.appearance);
  const updateAppearance = useSettingsStore((state) => state.updateAppearance);
  const updatePostProcessing = useSettingsStore(
    (state) => state.updatePostProcessing
  );
  const effects = appearance.postProcessing;

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
              options={THEME_OPTIONS}
              onChange={(theme) => {
                updateAppearance({ theme });
              }}
            />
          }
        />

        <SettingRow
          label={t("settings.appearance.density")}
          control={
            <Dropdown
              label={t("settings.appearance.density")}
              value={appearance.density}
              options={DENSITY_OPTIONS}
              onChange={(density) => {
                updateAppearance({ density });
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
          label={t("settings.appearance.reduceMotion")}
          control={
            <Toggle
              ariaLabel={t("settings.appearance.reduceMotion")}
              checked={appearance.reduceMotion}
              onChange={(reduceMotion) => {
                updateAppearance({ reduceMotion });
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
              options={INTENSITY_OPTIONS}
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
              options={INTENSITY_OPTIONS}
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
              options={QUALITY_OPTIONS}
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
