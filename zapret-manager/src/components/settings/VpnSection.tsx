// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/SectionContainer.
import SectionContainer from "@/components/settings/SectionContainer";
// Импортируем зависимости из модуля @/components/settings/SettingRow.
import SettingRow from "@/components/settings/SettingRow";
// Импортируем зависимости из модуля @/components/ui/Toggle.
import Toggle from "@/components/ui/Toggle";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Настройки VPN в одном месте.
 * Настройки VPN в одном месте.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * VPN работает только через ядро Xray: серверы приходят из п…
 * VPN работает только через ядро Xray: серверы приходят из подписки,
 // Сохраняем пояснение разработчика: * а туннель поднимается на самом быстром узле. Конфигов Wire…
 * а туннель поднимается на самом быстром узле. Конфигов WireGuard и
 // Сохраняем пояснение разработчика: * AmneziaWG больше нет — их список и настройки убраны, чтобы…
 * AmneziaWG больше нет — их список и настройки убраны, чтобы в
 // Сохраняем пояснение разработчика: * интерфейсе не осталось ничего от прежнего стека.
 * интерфейсе не осталось ничего от прежнего стека.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function VpnSection() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const vpn = useSettingsStore((state) => state.settings.….
  const vpn = useSettingsStore((state) => state.settings.vpn);
  // Обрабатываем конструкцию: const updateVpn = useSettingsStore((state) => state.upd….
  const updateVpn = useSettingsStore((state) => state.updateVpn);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <SectionContainer title={t(settings.vpn.title)} descr….
  return (
    // Обрабатываем конструкцию: <SectionContainer title={t(settings.vpn.title)} descrip….
    <SectionContainer
      // Обрабатываем конструкцию: title.
      title={t("settings.vpn.title")}
      // Обрабатываем конструкцию: description.
      description={t("settings.vpn.description")}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.vpn.enabled")}
        // Обрабатываем конструкцию: description.
        description={t("settings.vpn.enabledHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.vpn.enabled")}
            // Обрабатываем конструкцию: checked.
            checked={vpn.enabled}
            // Обрабатываем конструкцию: onChange.
            onChange={(value) => {
              // Обрабатываем конструкцию: updateVpn.
              updateVpn({ enabled: value });
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
        label={t("settings.vpnPanel.autoConnectOnStart")}
        // Обрабатываем конструкцию: description.
        description={t("settings.vpnPanel.autoConnectOnStartHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.vpnPanel.autoConnectOnStart")}
            // Обрабатываем конструкцию: checked.
            checked={vpn.autoConnectOnStart}
            // Обрабатываем конструкцию: onChange.
            onChange={(value) => {
              // Обрабатываем конструкцию: updateVpn.
              updateVpn({ autoConnectOnStart: value });
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
