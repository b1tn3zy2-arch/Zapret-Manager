// Импортируем зависимости из модуля @/i18n.
import type { TranslationKey } from "@/i18n";
// Импортируем зависимости из модуля @/types.
import type { SwitchStep, VpnState } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const VPN_STATS_INTERVAL_MS = 2000;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Как часто обновляется скорость в панели подключения.
/** Как часто обновляется скорость в панели подключения. */
// Обрабатываем конструкцию: export.
export const VPN_TRAFFIC_INTERVAL_MS = 1000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const VPN_AUTO_CONNECT_DELAY_MS = 5000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const HANDSHAKE_FRESH_SEC = 60;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SWITCH_STEP_LABELS: Record<SwitchStep, TranslationKey> = {
  // Обрабатываем конструкцию: stopping-dpi.
  "stopping-dpi": "settings.vpn.stepStoppingDpi",
  // Обрабатываем конструкцию: starting-vpn.
  "starting-vpn": "settings.vpn.stepStartingVpn",
  // Обрабатываем конструкцию: checking-handshake.
  "checking-handshake": "settings.vpn.stepCheckingHandshake",
  // Обрабатываем конструкцию: stopping-vpn.
  "stopping-vpn": "settings.vpn.stepStoppingVpn",
  // Обрабатываем конструкцию: done.
  done: "settings.vpn.stepDone",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const VPN_STATE_LABELS: Record<VpnState, TranslationKey> = {
  // Обрабатываем конструкцию: disconnected.
  disconnected: "settings.vpn.disconnected",
  // Обрабатываем конструкцию: connecting.
  connecting: "settings.vpn.connecting",
  // Обрабатываем конструкцию: connected.
  connected: "settings.vpn.connected",
  // Обрабатываем конструкцию: disconnecting.
  disconnecting: "settings.vpn.disconnecting",
  // Обрабатываем конструкцию: error.
  error: "settings.vpn.error",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Подписи тарифов по идентификатору плана.
 * Подписи тарифов по идентификатору плана.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Идентификатор приходит из Rust, подпись — отсюда: так назв…
 * Идентификатор приходит из Rust, подпись — отсюда: так название
 // Сохраняем пояснение разработчика: * тарифа остаётся переводимым и не зависит от того, как его …
 * тарифа остаётся переводимым и не зависит от того, как его назвали
 // Сохраняем пояснение разработчика: * в панели.
 * в панели.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export const TARIFF_PLAN_LABELS: Record<string, TranslationKey> = {
  // Обрабатываем конструкцию: 1m.
  "1m": "dashboard.vpn.tariff.month1",
  // Обрабатываем конструкцию: 3m.
  "3m": "dashboard.vpn.tariff.month3",
  // Обрабатываем конструкцию: 6m.
  "6m": "dashboard.vpn.tariff.month6",
  // Обрабатываем конструкцию: 12m.
  "12m": "dashboard.vpn.tariff.year",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —
