// Импортируем зависимости из модуля lucide-react.
import {
  // Подключаем именованный импорт CalendarDays.
  CalendarDays,
  // Подключаем именованный импорт CreditCard.
  CreditCard,
  // Подключаем именованный импорт Link2.
  Link2,
  // Подключаем именованный импорт RefreshCw.
  RefreshCw,
  // Подключаем именованный импорт RotateCcw.
  RotateCcw,
  // Подключаем именованный импорт Trash2.
  Trash2,
  // Закрываем текущий блок.
} from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/components/ui.
import { Badge, Button, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { Translate } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/constants.
import { MAXIMA_TRAFFIC_RESET_URL } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/vpnCommands.
import { openPaymentWindow } from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { SubscriptionInfo } from "@/types";
// — разделитель логических блоков —

// Объявляем интерфейс SubscriptionCardProps с контрактом данных.
interface SubscriptionCardProps {
  // Обрабатываем конструкцию: info.
  info: SubscriptionInfo | null;
  // Обрабатываем конструкцию: isLoading.
  isLoading: boolean;
  // Обрабатываем конструкцию: isSaving.
  isSaving: boolean;
  // Обрабатываем конструкцию: isRefreshing.
  isRefreshing: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: onAdd.
  onAdd: () => void;
  // Обрабатываем конструкцию: onRemove.
  onRemove: () => void;
  // Обрабатываем конструкцию: onRefresh.
  onRefresh: () => void;
  // Обрабатываем конструкцию: onPay.
  onPay: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию daysLeftLabel.
function daysLeftLabel(days: number, t: Translate): string {
  // Обрабатываем конструкцию: const mod10 = days % 10.
  const mod10 = days % 10;
  // Обрабатываем конструкцию: const mod100 = days % 100.
  const mod100 = days % 100;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mod10 === 1 && mod100 !== 11.
  if (mod10 === 1 && mod100 !== 11) {
    // Возвращаем результат: t(dashboard.vpn.subscription.daysLeftOne, { days }).
    return t("dashboard.vpn.subscription.daysLeftOne", { days });
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14….
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    // Возвращаем результат: t(dashboard.vpn.subscription.daysLeftFew, { days }).
    return t("dashboard.vpn.subscription.daysLeftFew", { days });
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: t(dashboard.vpn.subscription.daysLeft, { days }).
  return t("dashboard.vpn.subscription.daysLeft", { days });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function SubscriptionCard({
  // Обрабатываем конструкцию: info.
  info,
  // Обрабатываем конструкцию: isLoading.
  isLoading,
  // Обрабатываем конструкцию: isSaving.
  isSaving,
  // Обрабатываем конструкцию: isRefreshing.
  isRefreshing,
  // Обрабатываем конструкцию: error.
  error,
  // Обрабатываем конструкцию: onAdd.
  onAdd,
  // Обрабатываем конструкцию: onRemove.
  onRemove,
  // Обрабатываем конструкцию: onRefresh.
  onRefresh,
  // Обрабатываем конструкцию: onPay.
  onPay,
  // Закрываем текущий блок.
}: SubscriptionCardProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const isLinked = info?.isLinked === true.
  const isLinked = info?.isLinked === true;
  // Обрабатываем конструкцию: const isActive = info?.isActive === true.
  const isActive = info?.isActive === true;
  // Обрабатываем конструкцию: const percent = info?.trafficPercent ?? null.
  const percent = info?.trafficPercent ?? null;
  // Обрабатываем конструкцию: const daysRemaining = info?.daysRemaining ?? null.
  const daysRemaining = info?.daysRemaining ?? null;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel variant=default padding=lg rounded=xl> <d….
  return (
    // Обрабатываем конструкцию: <GlassPanel variant=default padding=lg rounded=xl>.
    <GlassPanel variant="default" padding="lg" rounded="xl">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-4">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex items-start justify-between gap-3">
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="body" size="lg" className="text-text-primary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("dashboard.vpn.subscription.title")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {isLinked ? (
            // Обрабатываем конструкцию: <Badge variant={isActive ? success : error} dot pulse={….
            <Badge
              // Обрабатываем конструкцию: variant.
              variant={isActive ? "success" : "error"}
              // Задаём атрибут dot элемента.
              dot
              // Обрабатываем конструкцию: pulse.
              pulse={isActive}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {isActive
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  t("dashboard.vpn.subscription.active")
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  t("dashboard.vpn.subscription.expired")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Badge>
          ) : (
            // Продолжаем предыдущую конструкцию.
            // Закрываем выражение или список аргументов.
            // Обрабатываем конструкцию: <Badge variant=neutral>.
            <Badge variant="neutral">
              {/* Выводим текстовое содержимое в JSX. */}
              {t("dashboard.vpn.subscription.notAdded")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Badge>
            // Закрываем выражение или список аргументов.
          )}
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {isLinked ? (
          // Обрабатываем конструкцию: <div className=flex flex-col gap-4>.
          <div className="flex flex-col gap-4">
            {/* Выводим текстовое содержимое в JSX. */}
            {info?.title ? (
              // Обрабатываем конструкцию: <Text variant=body size=sm className=text-text-secondar….
              <Text
                // Обрабатываем конструкцию: variant.
                variant="body"
                // Обрабатываем конструкцию: size.
                size="sm"
                // Обрабатываем конструкцию: className.
                className="text-text-secondary"
                // Обрабатываем конструкцию: title.
                title={info.title}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {info.title}
                {/* Выводим текстовое содержимое в JSX. */}
              </Text>
            ) : // Закрываем выражение или список аргументов.
            // Продолжаем предыдущую конструкцию.
            null}
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            {percent !== null ? (
              // Обрабатываем конструкцию: <div className=flex flex-col gap-2>.
              <div className="flex flex-col gap-2">
                {/* Выводим текстовое содержимое в JSX. */}
                <div
                  // Обрабатываем конструкцию: role.
                  role="progressbar"
                  // Обрабатываем конструкцию: aria-valuemin.
                  aria-valuemin={0}
                  // Обрабатываем конструкцию: aria-valuemax.
                  aria-valuemax={100}
                  // Обрабатываем конструкцию: aria-valuenow.
                  aria-valuenow={Math.round(percent)}
                  // Обрабатываем конструкцию: aria-label.
                  aria-label={t("dashboard.vpn.subscription.trafficAriaLabel")}
                  // Обрабатываем конструкцию: className.
                  className="bg-glass-hover h-2 w-full overflow-hidden rounded-full"
                  // Продолжаем выражение.
                >
                  {/* Выводим текстовое содержимое в JSX. */}
                  <div
                    // Обрабатываем конструкцию: className.
                    className={cn(
                      // Обрабатываем конструкцию: h-full rounded-full transition-[width] duration-500 eas….
                      "h-full rounded-full transition-[width] duration-500 ease-out",
                      // Обрабатываем конструкцию: percent.
                      percent >= 90 ? "bg-accent-danger" : "bg-accent-primary"
                      // Закрываем выражение или список аргументов.
                    )}
                    // Обрабатываем конструкцию: style.
                    style={{ width: `${percent}%` }}
                    // Продолжаем выражение.
                  />
                  {/* Выводим текстовое содержимое в JSX. */}
                </div>
                {/* — разделитель логических блоков — */}

                {/* Выводим текстовое содержимое в JSX. */}
                <div className="flex items-baseline justify-between gap-3">
                  {/* Выводим текстовое содержимое в JSX. */}
                  <Text
                    // Обрабатываем конструкцию: variant.
                    variant="caption"
                    // Обрабатываем конструкцию: size.
                    size="sm"
                    // Обрабатываем конструкцию: className.
                    className="text-text-secondary"
                    // Продолжаем выражение.
                  >
                    {/* Выводим текстовое содержимое в JSX. */}
                    {t("dashboard.vpn.subscription.traffic", {
                      // Обрабатываем конструкцию: used.
                      used: (info?.trafficUsedGb ?? 0).toFixed(1),
                      // Обрабатываем конструкцию: limit.
                      limit: (info?.trafficLimitGb ?? 0).toFixed(1),
                      // Закрываем текущий блок.
                    })}
                    {/* Выводим текстовое содержимое в JSX. */}
                  </Text>
                  {/* — разделитель логических блоков — */}

                  {/* Выводим текстовое содержимое в JSX. */}
                  <Text
                    // Обрабатываем конструкцию: variant.
                    variant="caption"
                    // Обрабатываем конструкцию: size.
                    size="sm"
                    // Обрабатываем конструкцию: className.
                    className="text-text-tertiary"
                    // Продолжаем выражение.
                  >
                    {/* Выводим текстовое содержимое в JSX. */}
                    {t("dashboard.vpn.subscription.percent", {
                      // Обрабатываем конструкцию: percent.
                      percent: Math.round(percent),
                      // Закрываем текущий блок.
                    })}
                    {/* Выводим текстовое содержимое в JSX. */}
                  </Text>
                  {/* Выводим текстовое содержимое в JSX. */}
                </div>
                {/* Выводим текстовое содержимое в JSX. */}
              </div>
            ) : // Закрываем выражение или список аргументов.
            // Продолжаем предыдущую конструкцию.
            null}
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            <dl className="text-text-tertiary grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
              {/* Выводим текстовое содержимое в JSX. */}
              <div className="flex items-center gap-1.5">
                {/* Выводим текстовое содержимое в JSX. */}
                <dt>{t("dashboard.vpn.subscription.servers")}:</dt>
                {/* Выводим текстовое содержимое в JSX. */}
                <dd className="text-text-secondary">
                  {/* Выводим текстовое содержимое в JSX. */}
                  {info?.serverCount ?? t("common.noData")}
                  {/* Выводим текстовое содержимое в JSX. */}
                </dd>
                {/* Выводим текстовое содержимое в JSX. */}
              </div>
              {/* — разделитель логических блоков — */}

              {/* Выводим текстовое содержимое в JSX. */}
              <div className="flex items-center gap-1.5">
                {/* Выводим текстовое содержимое в JSX. */}
                <dt>{t("dashboard.vpn.subscription.expires")}:</dt>
                {/* Выводим текстовое содержимое в JSX. */}
                <dd className="text-text-secondary">
                  {/* Выводим текстовое содержимое в JSX. */}
                  {info?.expiresAt
                    ? // Обрабатываем конструкцию: ?.
                      // Продолжаем предыдущую конструкцию.
                      new Date(info.expiresAt * 1000).toLocaleDateString()
                    : // Обрабатываем конструкцию: :.
                      // Продолжаем предыдущую конструкцию.
                      t("common.noData")}
                  {/* Выводим текстовое содержимое в JSX. */}
                </dd>
                {/* Выводим текстовое содержимое в JSX. */}
              </div>
              {/* Выводим текстовое содержимое в JSX. */}
            </dl>
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Выводим текстовое содержимое в JSX. */}
              <span className="text-text-secondary flex items-center gap-2 text-sm">
                {/* Выводим текстовое содержимое в JSX. */}
                <CalendarDays aria-hidden="true" className="size-4" />
                {/* Выводим текстовое содержимое в JSX. */}
                {daysRemaining === null
                  ? // Обрабатываем конструкцию: ?.
                    // Продолжаем предыдущую конструкцию.
                    t("dashboard.vpn.subscription.expiryNotSent")
                  : // Обрабатываем конструкцию: :.
                    // Продолжаем предыдущую конструкцию.
                    daysLeftLabel(daysRemaining, t)}
                {/* Выводим текстовое содержимое в JSX. */}
              </span>
              {/* — разделитель логических блоков — */}

              {/* Выводим текстовое содержимое в JSX. */}
              <div className="flex items-center gap-2">
                {/* Выводим текстовое содержимое в JSX. */}
                {isActive ? (
                  // Обрабатываем конструкцию: <Button variant=ghost size=sm disabled={isSaving || isR….
                  <Button
                    // Обрабатываем конструкцию: variant.
                    variant="ghost"
                    // Обрабатываем конструкцию: size.
                    size="sm"
                    // Обрабатываем конструкцию: disabled.
                    disabled={isSaving || isRefreshing}
                    // Обрабатываем конструкцию: icon.
                    icon={<RotateCcw aria-hidden="true" className="size-4" />}
                    // Обрабатываем конструкцию: onClick.
                    onClick={() => {
                      // Обрабатываем конструкцию: void openPaymentWindow( MAXIMA_TRAFFIC_RESET_URL, t(das….
                      void openPaymentWindow(
                        // Обрабатываем конструкцию: MAXIMA_TRAFFIC_RESET_URL.
                        MAXIMA_TRAFFIC_RESET_URL,
                        // Обрабатываем конструкцию: t.
                        t("dashboard.vpn.payment.windowTitle")
                        // Закрываем выражение или список аргументов.
                      ).catch((caught: unknown) => {
                        // Сохраняем пояснение разработчика: // Dev-диагностика на английском: i18n-check
                        // Dev-диагностика на английском: i18n-check
                        // Сохраняем пояснение разработчика: // защищает только строки, видимые пользователю.
                        // защищает только строки, видимые пользователю.
                        // Обрабатываем конструкцию: console.
                        console.warn(
                          // Обрабатываем конструкцию: Failed to open traffic reset window.
                          "Failed to open traffic reset window",
                          // Обрабатываем конструкцию: caught.
                          caught
                          // Закрываем выражение или список аргументов.
                        );
                        // Закрываем текущий блок.
                      });
                      // Закрываем текущий блок.
                    }}
                    // Продолжаем выражение.
                  >
                    {/* Выводим текстовое содержимое в JSX. */}
                    {t("dashboard.vpn.subscription.resetTraffic")}
                    {/* Выводим текстовое содержимое в JSX. */}
                  </Button>
                ) : // Закрываем выражение или список аргументов.
                // Продолжаем предыдущую конструкцию.
                null}
                {/* — разделитель логических блоков — */}

                {/* Выводим текстовое содержимое в JSX. */}
                <Button
                  // Обрабатываем конструкцию: variant.
                  variant="ghost"
                  // Обрабатываем конструкцию: size.
                  size="sm"
                  // Обрабатываем конструкцию: disabled.
                  disabled={isSaving || isRefreshing}
                  // Обрабатываем конструкцию: onClick.
                  onClick={onRemove}
                  // Обрабатываем конструкцию: icon.
                  icon={<Trash2 aria-hidden="true" className="size-4" />}
                  // Продолжаем выражение.
                >
                  {/* Выводим текстовое содержимое в JSX. */}
                  {t("dashboard.vpn.subscription.remove")}
                  {/* Выводим текстовое содержимое в JSX. */}
                </Button>
                {/* — разделитель логических блоков — */}

                {/* Выводим текстовое содержимое в JSX. */}
                <Button
                  // Обрабатываем конструкцию: variant.
                  variant="primary"
                  // Обрабатываем конструкцию: size.
                  size="sm"
                  // Обрабатываем конструкцию: disabled.
                  disabled={isSaving || isRefreshing}
                  // Обрабатываем конструкцию: onClick.
                  onClick={onPay}
                  // Обрабатываем конструкцию: icon.
                  icon={<CreditCard aria-hidden="true" className="size-4" />}
                  // Продолжаем выражение.
                >
                  {/* Выводим текстовое содержимое в JSX. */}
                  {/* Купленная подписка продлевается: формулировка
                      // Продолжаем выражение.
                      совпадает с кнопкой на сайте Maxima VPS. */}
                  {/* Выводим текстовое содержимое в JSX. */}
                  {t(
                    // Обрабатываем конструкцию: isActive.
                    isActive
                      ? // Обрабатываем конструкцию: ?.
                        // Продолжаем предыдущую конструкцию.
                        "dashboard.vpn.subscription.renew"
                      : // Обрабатываем конструкцию: :.
                        // Продолжаем предыдущую конструкцию.
                        "dashboard.vpn.subscription.pay"
                    // Закрываем выражение или список аргументов.
                  )}
                  {/* Выводим текстовое содержимое в JSX. */}
                </Button>
                {/* Выводим текстовое содержимое в JSX. */}
              </div>
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
        ) : (
          // Продолжаем предыдущую конструкцию.
          // Закрываем выражение или список аргументов.
          // Обрабатываем конструкцию: <div className=flex flex-col items-start gap-3>.
          <div className="flex flex-col items-start gap-3">
            {/* Выводим текстовое содержимое в JSX. */}
            <Text variant="caption" size="sm" className="text-text-secondary">
              {/* Выводим текстовое содержимое в JSX. */}
              {error !== null
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  error
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  t("dashboard.vpn.subscription.notAddedHint")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Text>
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Выводим текстовое содержимое в JSX. */}
              <Button
                // Обрабатываем конструкцию: variant.
                variant="primary"
                // Обрабатываем конструкцию: disabled.
                disabled={isSaving}
                // Обрабатываем конструкцию: onClick.
                onClick={onAdd}
                // Обрабатываем конструкцию: icon.
                icon={<Link2 aria-hidden="true" className="size-4" />}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {t("dashboard.vpn.subscription.add")}
                {/* Выводим текстовое содержимое в JSX. */}
              </Button>
              {/* — разделитель логических блоков — */}

              {/* Выводим текстовое содержимое в JSX. */}
              {/* Покупка через приложение доступна и без подписки:
                  // Продолжаем выражение.
                  одна кнопка «Оплатить» открывает модалку с тарифами
                  // Продолжаем выражение.
                  прямо с главной; сайт провайдера больше не дублируется
                  // Продолжаем выражение.
                  рядом с ней. */}
              {/* Выводим текстовое содержимое в JSX. */}
              <Button
                // Обрабатываем конструкцию: variant.
                variant="ghost"
                // Обрабатываем конструкцию: disabled.
                disabled={isSaving}
                // Обрабатываем конструкцию: onClick.
                onClick={onPay}
                // Обрабатываем конструкцию: icon.
                icon={<CreditCard aria-hidden="true" className="size-4" />}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {t("dashboard.vpn.subscription.pay")}
                {/* Выводим текстовое содержимое в JSX. */}
              </Button>
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          // Закрываем выражение или список аргументов.
        )}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="mt-4 flex justify-end">
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: disabled.
          disabled={!isLinked || isLoading || isSaving || isRefreshing}
          // Обрабатываем конструкцию: onClick.
          onClick={onRefresh}
          // Обрабатываем конструкцию: icon.
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("dashboard.vpn.subscription.refresh")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
