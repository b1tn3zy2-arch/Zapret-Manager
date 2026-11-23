// Импортируем зависимости из модуля react.
import { useCallback, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/vpn/AddSubscriptionModal.
import AddSubscriptionModal from "@/components/dashboard/vpn/AddSubscriptionModal";
// Импортируем зависимости из модуля @/components/dashboard/vpn/AutoConnectBlock.
import AutoConnectBlock from "@/components/dashboard/vpn/AutoConnectBlock";
// Импортируем зависимости из модуля @/components/dashboard/vpn/PaymentModal.
import PaymentModal from "@/components/dashboard/vpn/PaymentModal";
// Импортируем зависимости из модуля @/components/dashboard/vpn/SubscriptionCard.
import SubscriptionCard from "@/components/dashboard/vpn/SubscriptionCard";
// Импортируем зависимости из модуля @/components/dashboard/vpn/VpnConnectedPanel.
import VpnConnectedPanel from "@/components/dashboard/vpn/VpnConnectedPanel";
// Импортируем зависимости из модуля @/hooks/useVpnCore.
import { useVpnCore } from "@/hooks/useVpnCore";
// Импортируем зависимости из модуля @/hooks/useSubscriptionInfo.
import { useSubscriptionInfo } from "@/hooks/useSubscriptionInfo";
// Импортируем зависимости из модуля @/hooks/useVpnTraffic.
import { useVpnTraffic, useVpnUptime } from "@/hooks/useVpnTraffic";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useVpnCoreStore.
import { useVpnCoreStore } from "@/stores/useVpnCoreStore";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Режим VPN.
 * Режим VPN.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Серверов в интерфейсе нет: подписку добавляет пользователь…
 * Серверов в интерфейсе нет: подписку добавляет пользователь,
 // Сохраняем пояснение разработчика: * список всегда свежий и скачивается приложением при подключ…
 * список всегда свежий и скачивается приложением при подключении.
 // Сохраняем пояснение разработчика: * По порядку блоков читается главное: кнопка — действие, а к…
 * По порядку блоков читается главное: кнопка — действие, а карточка
 // Сохраняем пояснение разработчика: * подписки — состояние и место для добавления ссылки.
 * подписки — состояние и место для добавления ссылки.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function VpnMode() {
  // Обрабатываем конструкцию: const status = useVpnCoreStore((state) => state.status).
  const status = useVpnCoreStore((state) => state.status);
  // Обрабатываем конструкцию: const activeServerName = useVpnCoreStore((state) => sta….
  const activeServerName = useVpnCoreStore((state) => state.activeServerName);
  // Обрабатываем конструкцию: const error = useVpnCoreStore((state) => state.error).
  const error = useVpnCoreStore((state) => state.error);
  // Обрабатываем конструкцию: const setActiveServer = useVpnCoreStore((state) => stat….
  const setActiveServer = useVpnCoreStore((state) => state.setActiveServer);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const vpnEnabled = useSettingsStore((state) => state.se….
  const vpnEnabled = useSettingsStore((state) => state.settings.vpn.enabled);
  // Обрабатываем конструкцию: const { refreshStatus } = useVpnCore().
  const { refreshStatus } = useVpnCore();
  // Обрабатываем конструкцию: const { info, matrix, isLoading: isInfoLoading, error: ….
  const {
    // Обрабатываем конструкцию: info.
    info,
    // Обрабатываем конструкцию: matrix.
    matrix,
    // Обрабатываем конструкцию: isLoading.
    isLoading: isInfoLoading,
    // Обрабатываем конструкцию: error.
    error: infoError,
    // Обрабатываем конструкцию: isSaving.
    isSaving,
    // Обрабатываем конструкцию: isRefreshing.
    isRefreshing,
    // Обрабатываем конструкцию: add.
    add,
    // Обрабатываем конструкцию: remove.
    remove,
    // Обрабатываем конструкцию: refresh.
    refresh,
    // Обрабатываем конструкцию: reload.
    reload,
    // Закрываем текущий блок.
  } = useSubscriptionInfo();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [paymentOpen, setPaymentOpen] = useState(false).
  const [paymentOpen, setPaymentOpen] = useState(false);
  // Обрабатываем конструкцию: const [addOpen, setAddOpen] = useState(false).
  const [addOpen, setAddOpen] = useState(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const connected = status?.running === true.
  const connected = status?.running === true;
  // Обрабатываем конструкцию: const traffic = useVpnTraffic(connected).
  const traffic = useVpnTraffic(connected);
  // Обрабатываем конструкцию: const uptime = useVpnUptime(status).
  const uptime = useVpnUptime(status);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const hasSubscription = info?.isLinked === true.
  const hasSubscription = info?.isLinked === true;
  // Обрабатываем конструкцию: const subscriptionActive = hasSubscription && (info?.is….
  const subscriptionActive = hasSubscription && (info?.isActive ?? false);
  // Обрабатываем конструкцию: const needSubscription = vpnEnabled && !subscriptionAct….
  const needSubscription = vpnEnabled && !subscriptionActive;
  // Сохраняем пояснение разработчика: // Тумблер VPN в настройках выключен — кнопка лишь подсказыв…
  // Тумблер VPN в настройках выключен — кнопка лишь подсказывает, где
  // Сохраняем пояснение разработчика: // включить, а не обещает подключение.
  // включить, а не обещает подключение.
  // Обрабатываем конструкцию: const vpnOff = !vpnEnabled.
  const vpnOff = !vpnEnabled;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleAutoConnected = useCallback( (serverId: str….
  const handleAutoConnected = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (serverId: string, serverName: string): void => {
      // Обрабатываем конструкцию: setActiveServer.
      setActiveServer(serverId, serverName);
      // Обрабатываем конструкцию: void refreshStatus().
      void refreshStatus();
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [refreshStatus, setActiveServer]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col gap-6> {connected ? ( <V….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-6>.
    <div className="flex flex-col gap-6">
      {/* Выводим текстовое содержимое в JSX. */}
      {connected ? (
        // Рендерим самозакрывающийся элемент VpnConnectedPanel.
        <VpnConnectedPanel
          // Обрабатываем конструкцию: speedIn.
          speedIn={traffic.speedIn}
          // Обрабатываем конструкцию: speedOut.
          speedOut={traffic.speedOut}
          // Обрабатываем конструкцию: uptimeSec.
          uptimeSec={uptime}
          // Обрабатываем конструкцию: serverName.
          serverName={activeServerName}
          // Продолжаем выражение.
        />
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {/* Большая кнопка живёт прямо на фоне приложения, без стеклянной
          // Продолжаем выражение.
          панели: так она читается как главное действие страницы, как
          // Продолжаем выражение.
          hero-кнопка главной. */}
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col items-center gap-5">
        {/* Выводим текстовое содержимое в JSX. */}
        <AutoConnectBlock
          // Обрабатываем конструкцию: disabled.
          disabled={!vpnEnabled || !subscriptionActive}
          // Обрабатываем конструкцию: vpnDisabled.
          vpnDisabled={vpnOff}
          // Обрабатываем конструкцию: subscriptionRequired.
          subscriptionRequired={needSubscription}
          // Обрабатываем конструкцию: onConnected.
          onConnected={handleAutoConnected}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {error !== null ? (
          // Обрабатываем конструкцию: <p className=text-accent-danger text-center text-xs>.
          <p className="text-accent-danger text-center text-xs">{error}</p>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SubscriptionCard
        // Обрабатываем конструкцию: info.
        info={info}
        // Обрабатываем конструкцию: isLoading.
        isLoading={isInfoLoading}
        // Обрабатываем конструкцию: isSaving.
        isSaving={isSaving}
        // Обрабатываем конструкцию: isRefreshing.
        isRefreshing={isRefreshing}
        // Обрабатываем конструкцию: error.
        error={infoError}
        // Обрабатываем конструкцию: onAdd.
        onAdd={() => {
          // Обрабатываем конструкцию: setAddOpen.
          setAddOpen(true);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onRemove.
        onRemove={() => {
          // Обрабатываем конструкцию: void remove().
          void remove();
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onRefresh.
        onRefresh={() => {
          // Обрабатываем конструкцию: void refresh().
          void refresh();
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onPay.
        onPay={() => {
          // Обрабатываем конструкцию: setPaymentOpen.
          setPaymentOpen(true);
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <PaymentModal
        // Обрабатываем конструкцию: open.
        open={paymentOpen}
        // Обрабатываем конструкцию: matrix.
        matrix={matrix}
        // Обрабатываем конструкцию: onClose.
        onClose={() => {
          // Обрабатываем конструкцию: setPaymentOpen.
          setPaymentOpen(false);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onPaid.
        onPaid={() => {
          // Обрабатываем конструкцию: void reload().
          void reload();
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onAutoAdded.
        onAutoAdded={add}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <AddSubscriptionModal
        // Обрабатываем конструкцию: open.
        open={addOpen}
        // Обрабатываем конструкцию: isSaving.
        isSaving={isSaving}
        // Обрабатываем конструкцию: error.
        error={infoError}
        // Обрабатываем конструкцию: onClose.
        onClose={() => {
          // Обрабатываем конструкцию: setAddOpen.
          setAddOpen(false);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onSubmit.
        onSubmit={(url) => {
          // Обрабатываем конструкцию: void add(url).then((added) => { if (added) { setAddOpen….
          void add(url).then((added) => {
            // Проверяем бизнес-условие: added.
            if (added) {
              // Обрабатываем конструкцию: setAddOpen.
              setAddOpen(false);
              // Закрываем текущий блок.
            }
            // Закрываем текущий блок.
          });
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
