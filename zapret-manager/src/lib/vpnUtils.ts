// Импортируем зависимости из модуля @/lib/vpnConstants.
import { HANDSHAKE_FRESH_SEC, VPN_STATE_LABELS } from "@/lib/vpnConstants";
// Импортируем зависимости из модуля @/i18n.
import type { Translate } from "@/i18n";
// Импортируем зависимости из модуля @/types.
import type { VpnState } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatHandshakeTime(
  // Обрабатываем конструкцию: timestamp.
  timestamp: number | null,
  // Обрабатываем конструкцию: t.
  t: Translate
  // Закрываем выражение или список аргументов.
): string {
  // Проверяем бизнес-условие: timestamp === null.
  if (timestamp === null) {
    // Возвращаем результат: t(settings.vpn.handshakeNever).
    return t("settings.vpn.handshakeNever");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const seconds = Math.max(0, Math.floor((Date.now() - ti….
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: seconds < HANDSHAKE_FRESH_SEC.
  if (seconds < HANDSHAKE_FRESH_SEC) {
    // Возвращаем результат: t(settings.vpn.secondsAgo).replace({value}, String(seco….
    return t("settings.vpn.secondsAgo").replace("{value}", String(seconds));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const minutes = Math.floor(seconds / 60).
  const minutes = Math.floor(seconds / 60);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: minutes < 60.
  if (minutes < 60) {
    // Возвращаем результат: t(settings.vpn.minutesAgo).replace({value}, String(minu….
    return t("settings.vpn.minutesAgo").replace("{value}", String(minutes));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: t(settings.vpn.hoursAgo).replace( {value}, String(Math.….
  return t("settings.vpn.hoursAgo").replace(
    // Обрабатываем конструкцию: {value}.
    "{value}",
    // Обрабатываем конструкцию: String.
    String(Math.floor(minutes / 60))
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatVpnState(state: VpnState, t: Translate): string {
  // Обрабатываем конструкцию: const label = VPN_STATE_LABELS[state].
  const label = VPN_STATE_LABELS[state];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: label === null.
  if (label === null) {
    // Возвращаем результат: t(settings.vpn.disconnected).
    return t("settings.vpn.disconnected");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: t(label).
  return t(label);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatUptime(seconds: number | null): string {
  // Проверяем бизнес-условие: seconds === null || seconds <= 0.
  if (seconds === null || seconds <= 0) {
    // Возвращаем результат: —.
    return "—";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const hours = Math.floor(seconds / 3600).
  const hours = Math.floor(seconds / 3600);
  // Обрабатываем конструкцию: const minutes = Math.floor((seconds % 3600) / 60).
  const minutes = Math.floor((seconds % 3600) / 60);
  // Обрабатываем конструкцию: const rest = seconds % 60.
  const rest = seconds % 60;
  // — разделитель логических блоков —

  // Возвращаем результат: [hours, minutes, rest] .map((value) => String(value).pa….
  return (
    // Продолжаем предыдущую конструкцию.
    [hours, minutes, rest]
      // Продолжаем цепочку вызовов.
      .map((value) => String(value).padStart(2, "0"))
      // Продолжаем цепочку вызовов.
      .join(":")
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isHandshakeFresh(timestamp: number | null): boolean {
  // Проверяем бизнес-условие: timestamp === null.
  if (timestamp === null) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: (Date.now() - timestamp) / 1000 < HANDSHAKE_FRESH_SEC.
  return (Date.now() - timestamp) / 1000 < HANDSHAKE_FRESH_SEC;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatEndpoint(endpoint: string): string {
  // Обрабатываем конструкцию: const [host, port] = endpoint.split(:).
  const [host, port] = endpoint.split(":");
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: host === undefined || port === undefined.
  if (host === undefined || port === undefined) {
    // Возвращаем результат: endpoint.
    return endpoint;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ${host}:${port}.
  return `${host}:${port}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
