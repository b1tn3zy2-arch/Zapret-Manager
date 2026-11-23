// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useMemo, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/vpn/ConnectButton.
import ConnectButton from "@/components/dashboard/vpn/ConnectButton";
// Импортируем зависимости из модуля @/components/ui.
import { Badge, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useVpnCore.
import { useVpnCore } from "@/hooks/useVpnCore";
// Импортируем зависимости из модуля @/lib/vpnCommands.
import { autoConnectVpn } from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useVpnCoreStore.
import { useVpnCoreStore } from "@/stores/useVpnCoreStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AutoConnectBlockProps {
  // Обрабатываем конструкцию: disabled.
  disabled: boolean;
  // Обрабатываем конструкцию: vpnDisabled.
  vpnDisabled: boolean;
  // Сохраняем пояснение разработчика: Ссылка на подписку ещё не добавлена или уже истекла.
  /** Ссылка на подписку ещё не добавлена или уже истекла. */
  // Обрабатываем конструкцию: subscriptionRequired.
  subscriptionRequired?: boolean;
  // Сохраняем пояснение разработчика: Вызывается после успешного подключения — чтобы обновить стор…
  /** Вызывается после успешного подключения — чтобы обновить стори. */
  // Обрабатываем конструкцию: onConnected.
  onConnected: (serverId: string, serverName: string) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Умное подключение: приложение само выбирает самый быстрый
 * Умное подключение: приложение само выбирает самый быстрый
 // Сохраняем пояснение разработчика: * сервер и поднимает на нём туннель.
 * сервер и поднимает на нём туннель.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Список серверов приложение берёт само и каждый раз заново:…
 * Список серверов приложение берёт само и каждый раз заново: сначала
 // Сохраняем пояснение разработчика: * скачивает подписку, потом замеряет отклик всех серверов и
 * скачивает подписку, потом замеряет отклик всех серверов и
 // Сохраняем пояснение разработчика: * подключается к самому быстрому. Интерфейс только показывае…
 * подключается к самому быстрому. Интерфейс только показывает
 // Сохраняем пояснение разработчика: * результат.
 * результат.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function AutoConnectBlock({
  // Обрабатываем конструкцию: disabled.
  disabled,
  // Обрабатываем конструкцию: vpnDisabled.
  vpnDisabled,
  // Обрабатываем конструкцию: subscriptionRequired.
  subscriptionRequired = false,
  // Обрабатываем конструкцию: onConnected.
  onConnected,
  // Закрываем текущий блок.
}: AutoConnectBlockProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { disconnect } = useVpnCore().
  const { disconnect } = useVpnCore();
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const setStatus = useVpnCoreStore((state) => state.setS….
  const setStatus = useVpnCoreStore((state) => state.setStatus);
  // Обрабатываем конструкцию: const setActiveServer = useVpnCoreStore((state) => stat….
  const setActiveServer = useVpnCoreStore((state) => state.setActiveServer);
  // Обрабатываем конструкцию: const [isConnecting, setIsConnecting] = useState(false).
  const [isConnecting, setIsConnecting] = useState(false);
  // Обрабатываем конструкцию: const [serverName, setServerName] = useState<string | n….
  const [serverName, setServerName] = useState<string | null>(null);
  // Обрабатываем конструкцию: const [pingMs, setPingMs] = useState<number | null>(nul….
  const [pingMs, setPingMs] = useState<number | null>(null);
  // Обрабатываем конструкцию: const [failed, setFailed] = useState(false).
  const [failed, setFailed] = useState(false);
  // Сохраняем пояснение разработчика: // Причина сбоя: без неё пользователь видел «нет серверов» д…
  // Причина сбоя: без неё пользователь видел «нет серверов» даже когда
  // Сохраняем пояснение разработчика: // проблема в удалённом ядре Xray или в отключённой сети.
  // проблема в удалённом ядре Xray или в отключённой сети.
  // Обрабатываем конструкцию: const [failure, setFailure] = useState<string | null>(n….
  const [failure, setFailure] = useState<string | null>(null);
  // Сохраняем пояснение разработчика: // Этап установки ядра приходит из backend до подключения. Б…
  // Этап установки ядра приходит из backend до подключения. Без него
  // Сохраняем пояснение разработчика: // первый запуск минуту показывал одно и то же «ищу сервер».
  // первый запуск минуту показывал одно и то же «ищу сервер».
  // Обрабатываем конструкцию: const [coreStage, setCoreStage] = useState<string | nul….
  const [coreStage, setCoreStage] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const connected = useVpnCoreStore((state) => state.stat….
  const connected = useVpnCoreStore((state) => state.status?.running === true);
  // Обрабатываем конструкцию: const autoConnectRequest = useVpnCoreStore( (state) => ….
  const autoConnectRequest = useVpnCoreStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.autoConnectRequest
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const consumeAutoConnectRequest = useVpnCoreStore( (sta….
  const consumeAutoConnectRequest = useVpnCoreStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.consumeAutoConnectRequest
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const coreCaption = useMemo((): string | null => { swit….
  const coreCaption = useMemo((): string | null => {
    // Выбираем вариант по значению coreStage.
    switch (coreStage) {
      // Обрабатываем вариант checking.
      case "checking":
        // Возвращаем результат: t(dashboard.vpn.autoConnect.coreChecking).
        return t("dashboard.vpn.autoConnect.coreChecking");
      // Обрабатываем вариант unpacking.
      case "unpacking":
        // Возвращаем результат: t(dashboard.vpn.autoConnect.coreUnpacking).
        return t("dashboard.vpn.autoConnect.coreUnpacking");
      // Обрабатываем вариант downloading.
      case "downloading":
        // Возвращаем результат: t(dashboard.vpn.autoConnect.coreDownloading).
        return t("dashboard.vpn.autoConnect.coreDownloading");
      // Обрабатываем вариант ready.
      case "ready":
        // Возвращаем результат: t(dashboard.vpn.autoConnect.coreReady).
        return t("dashboard.vpn.autoConnect.coreReady");
      // Обрабатываем случай, когда ни один вариант не подошёл.
      default:
        // Возвращаем результат: null.
        return null;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [coreStage, t]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const caption = useMemo((): string => { if (isConnectin….
  const caption = useMemo((): string => {
    // Проверяем бизнес-условие: isConnecting.
    if (isConnecting) {
      // Возвращаем результат: coreCaption ?? t(dashboard.vpn.autoConnect.searching).
      return coreCaption ?? t("dashboard.vpn.autoConnect.searching");
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: connected && serverName !== null && pingMs !== null.
    if (connected && serverName !== null && pingMs !== null) {
      // Возвращаем результат: t(dashboard.vpn.autoConnect.connectedTo, { name: server….
      return t("dashboard.vpn.autoConnect.connectedTo", {
        // Обрабатываем конструкцию: name.
        name: serverName,
        // Обрабатываем конструкцию: ping.
        ping: pingMs,
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Нет подписки — главная причина неработающего подключения:…
    // Нет подписки — главная причина неработающего подключения: это
    // Сохраняем пояснение разработчика: // подсказку показываем даже раньше, чем «VPN выключен в нас…
    // подсказку показываем даже раньше, чем «VPN выключен в настройках».
    // Проверяем бизнес-условие: subscriptionRequired.
    if (subscriptionRequired) {
      // Возвращаем результат: t(dashboard.vpn.autoConnect.subscriptionRequired).
      return t("dashboard.vpn.autoConnect.subscriptionRequired");
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // VPN выключен в настройках — подсказываем, что делать, а н…
    // VPN выключен в настройках — подсказываем, что делать, а не
    // Сохраняем пояснение разработчика: // обещаем подключение, которого не будет.
    // обещаем подключение, которого не будет.
    // Проверяем бизнес-условие: vpnDisabled.
    if (vpnDisabled) {
      // Возвращаем результат: t(dashboard.vpn.disabledHint).
      return t("dashboard.vpn.disabledHint");
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: t(dashboard.vpn.autoConnect.idle).
    return t("dashboard.vpn.autoConnect.idle");
    // Закрываем текущий блок.
  }, [
    // Обрабатываем конструкцию: connected.
    connected,
    // Обрабатываем конструкцию: coreCaption.
    coreCaption,
    // Обрабатываем конструкцию: isConnecting.
    isConnecting,
    // Обрабатываем конструкцию: pingMs.
    pingMs,
    // Обрабатываем конструкцию: serverName.
    serverName,
    // Обрабатываем конструкцию: subscriptionRequired.
    subscriptionRequired,
    // Обрабатываем конструкцию: t.
    t,
    // Обрабатываем конструкцию: vpnDisabled.
    vpnDisabled,
    // Закрываем массив или список.
  ]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: let cancelled = false.
    let cancelled = false;
    // Обрабатываем конструкцию: let unlisten: (() => void) | null = null.
    let unlisten: (() => void) | null = null;
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const subscription = listen<string>(vpn-core-progress, ….
      const subscription = listen<string>("vpn-core-progress", (event) => {
        // Обрабатываем конструкцию: setCoreStage.
        setCoreStage(event.payload);
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: void subscription .then((stop) => { if (cancelled) { st….
      void subscription
        // Продолжаем цепочку вызовов.
        .then((stop) => {
          // Проверяем бизнес-условие: cancelled.
          if (cancelled) {
            // Обрабатываем конструкцию: stop.
            stop();
            // — разделитель логических блоков —

            // Завершаем функцию без возвращаемого значения.
            return;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: unlisten.
          unlisten = stop;
          // Закрываем текущий блок.
        })
        // Продолжаем цепочку вызовов.
        .catch(() => undefined);
      // Закрываем текущий блок.
    } catch {
      // Сохраняем пояснение разработчика: // В браузерных тестах Tauri IPC отсутствует: прогресс ядра
      // В браузерных тестах Tauri IPC отсутствует: прогресс ядра
      // Сохраняем пояснение разработчика: // просто не показывается, подключение продолжает работать.
      // просто не показывается, подключение продолжает работать.
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: () => { cancelled = true; unlisten?.(); }.
    return () => {
      // Обрабатываем конструкцию: cancelled.
      cancelled = true;
      // Обрабатываем конструкцию: unlisten.
      unlisten?.();
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleClick = useCallback(async (): Promise<void>….
  const handleClick = useCallback(async (): Promise<void> => {
    // Проверяем бизнес-условие: connected.
    if (connected) {
      // Сохраняем пояснение разработчика: // Повторное нажатие отключает: отдельной кнопки не нужно.
      // Повторное нажатие отключает: отдельной кнопки не нужно.
      // Ожидаем завершение асинхронной операции await disconnect().
      await disconnect();
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: isConnecting.
    if (isConnecting) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setIsConnecting.
    setIsConnecting(true);
    // Обрабатываем конструкцию: setFailed.
    setFailed(false);
    // Обрабатываем конструкцию: setFailure.
    setFailure(null);
    // Обрабатываем конструкцию: setCoreStage.
    setCoreStage(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const report = await autoConnectVpn().
      const report = await autoConnectVpn();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setServerName.
      setServerName(report.serverName);
      // Обрабатываем конструкцию: setPingMs.
      setPingMs(report.pingMs);
      // Обрабатываем конструкцию: setActiveServer.
      setActiveServer(report.serverId, report.serverName);
      // Обрабатываем конструкцию: setStatus.
      setStatus(report.status);
      // Обрабатываем конструкцию: onConnected.
      onConnected(report.serverId, report.serverName);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "success",
        // Обрабатываем конструкцию: source.
        source: "vpn",
        // Обрабатываем конструкцию: message.
        message: t("dashboard.vpn.autoConnect.connectedTo", {
          // Обрабатываем конструкцию: name.
          name: report.serverName,
          // Обрабатываем конструкцию: ping.
          ping: report.pingMs,
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: const message = toErrorMessage(caught).
      const message = toErrorMessage(caught);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setFailed.
      setFailed(true);
      // Обрабатываем конструкцию: setFailure.
      setFailure(message);
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "vpn",
        // Обрабатываем конструкцию: message.
        message: `${t("dashboard.vpn.autoConnect.failed")}: ${message}`,
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setIsConnecting.
      setIsConnecting(false);
      // Обрабатываем конструкцию: setCoreStage.
      setCoreStage(null);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [
    // Обрабатываем конструкцию: addLog.
    addLog,
    // Обрабатываем конструкцию: connected.
    connected,
    // Обрабатываем конструкцию: disconnect.
    disconnect,
    // Обрабатываем конструкцию: isConnecting.
    isConnecting,
    // Обрабатываем конструкцию: onConnected.
    onConnected,
    // Обрабатываем конструкцию: setActiveServer.
    setActiveServer,
    // Обрабатываем конструкцию: setStatus.
    setStatus,
    // Обрабатываем конструкцию: t.
    t,
    // Закрываем массив или список.
  ]);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Запрос на подключение может прийти из другого места: из и…
  // Запрос на подключение может прийти из другого места: из игры
  // Сохраняем пояснение разработчика: // («Включить VPN») или из трея. Запрос одноразовый: получив…
  // («Включить VPN») или из трея. Запрос одноразовый: получив его,
  // Сохраняем пояснение разработчика: // блок сбрасывает счётчик, чтобы при возврате в VPN-режим
  // блок сбрасывает счётчик, чтобы при возврате в VPN-режим
  // Сохраняем пояснение разработчика: // подключение не начиналось заново.
  // подключение не начиналось заново.
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: autoConnectRequest === 0.
    if (autoConnectRequest === 0) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Через микротаску: обновление состояния прямо в теле эффек…
    // Через микротаску: обновление состояния прямо в теле эффекта
    // Сохраняем пояснение разработчика: // вызывает лишний рендер (правило react-hooks/set-state-in-…
    // вызывает лишний рендер (правило react-hooks/set-state-in-effect).
    // Обрабатываем конструкцию: queueMicrotask.
    queueMicrotask(() => {
      // Обрабатываем конструкцию: consumeAutoConnectRequest.
      consumeAutoConnectRequest();
      // Обрабатываем конструкцию: void handleClick().
      void handleClick();
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }, [autoConnectRequest, consumeAutoConnectRequest, handleClick]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col items-center gap-3> <Con….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col items-center gap-3>.
    <div className="flex flex-col items-center gap-3">
      {/* Выводим текстовое содержимое в JSX. */}
      <ConnectButton
        // Обрабатываем конструкцию: connected.
        connected={connected}
        // Обрабатываем конструкцию: connecting.
        connecting={isConnecting}
        // Обрабатываем конструкцию: isSwitching.
        isSwitching={isConnecting}
        // Обрабатываем конструкцию: switchStep.
        switchStep={null}
        // Обрабатываем конструкцию: activeServerName.
        activeServerName={serverName}
        // Обрабатываем конструкцию: vpnDisabled.
        vpnDisabled={vpnDisabled}
        // Обрабатываем конструкцию: disabled.
        disabled={disabled}
        // Обрабатываем конструкцию: caption.
        caption={caption}
        // Обрабатываем конструкцию: onClick.
        onClick={() => {
          // Обрабатываем конструкцию: void handleClick().
          void handleClick();
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {failed ? (
        // Обрабатываем конструкцию: <div className=flex flex-col items-center gap-1.5>.
        <div className="flex flex-col items-center gap-1.5">
          {/* Выводим текстовое содержимое в JSX. */}
          <Badge variant="error" dot>
            {/* Выводим текстовое содержимое в JSX. */}
            {t("dashboard.vpn.autoConnect.connectionFailed")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Badge>
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="caption" size="sm" className="text-text-tertiary">
            {/* Выводим текстовое содержимое в JSX. */}
            {failure ?? t("dashboard.vpn.autoConnect.checkConnection")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
