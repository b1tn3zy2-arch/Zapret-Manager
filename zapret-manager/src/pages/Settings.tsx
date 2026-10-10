import AdvancedSection from "@/components/settings/AdvancedSection";
import AppearanceSection from "@/components/settings/AppearanceSection";
import GeneralSection from "@/components/settings/GeneralSection";
import ImportExportButtons from "@/components/settings/ImportExportButtons";
import OutlastTrialsSection from "@/components/settings/OutlastTrialsSection";
import SaveIndicator, {
  SaveErrorIndicator,
} from "@/components/settings/SaveIndicator";
import SettingsLayout from "@/components/settings/SettingsLayout";
import StrategiesSection from "@/components/settings/StrategiesSection";
import UpdatesSection from "@/components/settings/UpdatesSection";
import VpnSection from "@/components/settings/VpnSection";
import { Heading, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useAppStore } from "@/stores/useAppStore";
import type { SettingsSection } from "@/types";

export default function Settings() {
  const { t } = useI18n();
  const section = useAppStore((state) => state.settingsSection);
  const setSection = useAppStore((state) => state.setSettingsSection);

  const content = renderSection(section);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Heading level={1}>{t("settings.title")}</Heading>
          <Text variant="body" size="lg" className="text-text-secondary">
            {t("settings.subtitle")}
          </Text>
        </div>

        <ImportExportButtons />
      </header>

      <SettingsLayout
        active={section}
        sectionKey={section}
        onSectionChange={(next) => {
          setSection(next);
        }}
        t={t}
      >
        {content}
      </SettingsLayout>

      <SaveIndicator />
      <SaveErrorIndicator />
    </section>
  );
}

function renderSection(section: SettingsSection) {
  switch (section) {
    case "general":
      return <GeneralSection />;
    case "appearance":
      return <AppearanceSection />;
    case "strategies":
      return <StrategiesSection />;
    case "outlast":
      return <OutlastTrialsSection />;
    case "vpn":
      return <VpnSection />;
    case "updates":
      return <UpdatesSection />;
    case "advanced":
      return <AdvancedSection />;
  }
}
