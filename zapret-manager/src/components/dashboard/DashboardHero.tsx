// Импортируем зависимости из модуля react.
import type { ReactNode } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Badge, Button, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/components/dashboard/StatusOrb.
import StatusOrb from "@/components/dashboard/StatusOrb";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/constants.
import { CONNECTION_LABELS, type ConnectionStatus } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const HERO_STATUS = { connected: dashboard.hero.connect….
const HERO_STATUS = {
  // Обрабатываем конструкцию: connected.
  connected: "dashboard.hero.connected",
  // Обрабатываем конструкцию: connecting.
  connecting: "dashboard.hero.connecting",
  // Обрабатываем конструкцию: disconnected.
  disconnected: "dashboard.hero.disconnected",
  // Обрабатываем конструкцию: vpn.
  vpn: "dashboard.hero.vpn",
  // Обрабатываем конструкцию: error.
  error: "dashboard.hero.error",
  // Закрываем текущий блок.
} as const satisfies Record<ConnectionStatus, TranslationKey>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const BADGE_VARIANT = { connected: success, connecting:….
const BADGE_VARIANT = {
  // Обрабатываем конструкцию: connected.
  connected: "success",
  // Обрабатываем конструкцию: connecting.
  connecting: "warning",
  // Обрабатываем конструкцию: disconnected.
  disconnected: "neutral",
  // Обрабатываем конструкцию: vpn.
  vpn: "accent",
  // Обрабатываем конструкцию: error.
  error: "error",
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface DashboardHeroProps {
  // Обрабатываем конструкцию: status.
  status: ConnectionStatus;
  // Обрабатываем конструкцию: children.
  children?: ReactNode;
  // Обрабатываем конструкцию: strategyName.
  strategyName: string | null;
  // Обрабатываем конструкцию: vpnLabel.
  vpnLabel: string | null;
  // Обрабатываем конструкцию: uptime.
  uptime: string;
  // Обрабатываем конструкцию: isConnecting.
  isConnecting: boolean;
  // Обрабатываем конструкцию: onConnect.
  onConnect: () => void;
  // Обрабатываем конструкцию: onDisconnect.
  onDisconnect: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию DashboardHero.
function DashboardHero({
  // Обрабатываем конструкцию: status.
  status,
  // Обрабатываем конструкцию: children.
  children,
  // Обрабатываем конструкцию: strategyName.
  strategyName,
  // Обрабатываем конструкцию: vpnLabel.
  vpnLabel,
  // Обрабатываем конструкцию: uptime.
  uptime,
  // Обрабатываем конструкцию: isConnecting.
  isConnecting,
  // Обрабатываем конструкцию: onConnect.
  onConnect,
  // Обрабатываем конструкцию: onDisconnect.
  onDisconnect,
  // Закрываем текущий блок.
}: DashboardHeroProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const isActive = status === connected || status === con….
  const isActive =
    // Обрабатываем конструкцию: status.
    status === "connected" || status === "connecting" || status === "vpn";
  // Обрабатываем конструкцию: const badgeVariant = BADGE_VARIANT[status].
  const badgeVariant = BADGE_VARIANT[status];
  // Обрабатываем конструкцию: const isVpn = status === vpn.
  const isVpn = status === "vpn";
  // Обрабатываем конструкцию: const heading = isVpn ? vpnLabel === null ? t(settings.….
  const heading = isVpn
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      vpnLabel === null
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        t("settings.vpn.heroVpn")
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        `${t("settings.vpn.badgeVpn")}: ${vpnLabel}`
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      (strategyName ?? t("dashboard.hero.notConfigured"));
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex min-h-[200px] items-center gap-8>….
  return (
    // Обрабатываем конструкцию: <div className=flex min-h-[200px] items-center gap-8>.
    <div className="flex min-h-[200px] items-center gap-8">
      {/* Выводим текстовое содержимое в JSX. */}
      <StatusOrb status={status} />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <Badge variant={badgeVariant} dot={isActive} pulse={isActive}>
          {/* Выводим текстовое содержимое в JSX. */}
          {t(CONNECTION_LABELS[status])}
          {/* Выводим текстовое содержимое в JSX. */}
        </Badge>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-col gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          <h2 className="text-text-primary text-2xl font-bold tracking-tight">
            {/* Выводим текстовое содержимое в JSX. */}
            {heading}
            {/* Выводим текстовое содержимое в JSX. */}
          </h2>
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="body" size="sm" className="text-text-secondary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t(HERO_STATUS[status])}
            {/* Выводим текстовое содержимое в JSX. */}
            {isActive && uptime !== "--:--:--" ? ` · ${uptime}` : ""}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {children}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {isActive ? (
          // Обрабатываем конструкцию: <Button size=lg variant=danger disabled={isConnecting} ….
          <Button
            // Обрабатываем конструкцию: size.
            size="lg"
            // Обрабатываем конструкцию: variant.
            variant="danger"
            // Обрабатываем конструкцию: disabled.
            disabled={isConnecting}
            // Обрабатываем конструкцию: onClick.
            onClick={onDisconnect}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {isVpn
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("settings.vpn.disconnectVpn")
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("settings.vpn.disconnectBypass")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
        ) : (
          // Продолжаем предыдущую конструкцию.
          // Закрываем выражение или список аргументов.
          // Обрабатываем конструкцию: <Button size=lg disabled={isConnecting || strategyName ….
          <Button
            // Обрабатываем конструкцию: size.
            size="lg"
            // Обрабатываем конструкцию: disabled.
            disabled={isConnecting || strategyName === null}
            // Обрабатываем конструкцию: onClick.
            onClick={onConnect}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.vpn.connectBypass")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          // Закрываем выражение или список аргументов.
        )}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default DashboardHero;.
export default DashboardHero;
// — разделитель логических блоков —
