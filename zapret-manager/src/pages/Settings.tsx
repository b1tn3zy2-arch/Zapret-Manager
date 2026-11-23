// Импортируем зависимости из модуля @/components/settings/AdvancedSection.
import AdvancedSection from "@/components/settings/AdvancedSection";
// Импортируем зависимости из модуля @/components/settings/AppearanceSection.
import AppearanceSection from "@/components/settings/AppearanceSection";
// Импортируем зависимости из модуля @/components/settings/GeneralSection.
import GeneralSection from "@/components/settings/GeneralSection";
// Импортируем зависимости из модуля @/components/settings/ImportExportButtons.
import ImportExportButtons from "@/components/settings/ImportExportButtons";
// Импортируем зависимости из модуля @/components/settings/SaveIndicator.
import SaveIndicator, {
  // Подключаем именованный импорт SaveErrorIndicator.
  SaveErrorIndicator,
  // Закрываем текущий блок.
} from "@/components/settings/SaveIndicator";
// Импортируем зависимости из модуля @/components/settings/SettingsLayout.
import SettingsLayout from "@/components/settings/SettingsLayout";
// Импортируем зависимости из модуля @/components/settings/StrategiesSection.
import StrategiesSection from "@/components/settings/StrategiesSection";
// Импортируем зависимости из модуля @/components/settings/UpdatesSection.
import UpdatesSection from "@/components/settings/UpdatesSection";
// Импортируем зависимости из модуля @/components/settings/VpnSection.
import VpnSection from "@/components/settings/VpnSection";
// Импортируем зависимости из модуля @/components/ui.
import { Heading, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/types.
import type { SettingsSection } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Settings() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const section = useAppStore((state) => state.settingsSe….
  const section = useAppStore((state) => state.settingsSection);
  // Обрабатываем конструкцию: const setSection = useAppStore((state) => state.setSett….
  const setSection = useAppStore((state) => state.setSettingsSection);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const content = renderSection(section).
  const content = renderSection(section);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <section className=flex flex-col gap-6> <header class….
  return (
    // Обрабатываем конструкцию: <section className=flex flex-col gap-6>.
    <section className="flex flex-col gap-6">
      {/* Выводим текстовое содержимое в JSX. */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-col gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          <Heading level={1}>{t("settings.title")}</Heading>
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="body" size="lg" className="text-text-secondary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.subtitle")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <ImportExportButtons />
        {/* Выводим текстовое содержимое в JSX. */}
      </header>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SettingsLayout
        // Обрабатываем конструкцию: active.
        active={section}
        // Обрабатываем конструкцию: sectionKey.
        sectionKey={section}
        // Обрабатываем конструкцию: onSectionChange.
        onSectionChange={(next) => {
          // Обрабатываем конструкцию: setSection.
          setSection(next);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: t.
        t={t}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {content}
        {/* Выводим текстовое содержимое в JSX. */}
      </SettingsLayout>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SaveIndicator />
      {/* Выводим текстовое содержимое в JSX. */}
      <SaveErrorIndicator />
      {/* Выводим текстовое содержимое в JSX. */}
    </section>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию renderSection.
function renderSection(section: SettingsSection) {
  // Выбираем вариант по значению section.
  switch (section) {
    // Обрабатываем вариант general.
    case "general":
      // Возвращаем результат: <GeneralSection />.
      return <GeneralSection />;
    // Обрабатываем вариант vpn.
    case "vpn":
      // Возвращаем результат: <VpnSection />.
      return <VpnSection />;
    // Обрабатываем вариант appearance.
    case "appearance":
      // Возвращаем результат: <AppearanceSection />.
      return <AppearanceSection />;
    // Обрабатываем вариант strategies.
    case "strategies":
      // Возвращаем результат: <StrategiesSection />.
      return <StrategiesSection />;
    // Обрабатываем вариант updates.
    case "updates":
      // Возвращаем результат: <UpdatesSection />.
      return <UpdatesSection />;
    // Обрабатываем вариант advanced.
    case "advanced":
      // Возвращаем результат: <AdvancedSection />.
      return <AdvancedSection />;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
