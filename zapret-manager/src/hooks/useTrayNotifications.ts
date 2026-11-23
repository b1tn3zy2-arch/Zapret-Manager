// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля react.
import { useEffect, useRef } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { NOTIFY_EVENT } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/notifyProtocol.
import { parseNotify } from "@/lib/notifyProtocol";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useUpdateStore.
import { useUpdateStore } from "@/stores/useUpdateStore";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { useVpnStore } from "@/stores/useVpnStore";
// Импортируем зависимости из модуля @/types.
import type { LogLevel, NotificationKind } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const KIND_LEVEL: Record<NotificationKind, LogLevel> = ….
const KIND_LEVEL: Record<NotificationKind, LogLevel> = {
  // Обрабатываем конструкцию: success.
  success: "success",
  // Обрабатываем конструкцию: error.
  error: "error",
  // Обрабатываем конструкцию: warning.
  warning: "warn",
  // Обрабатываем конструкцию: info.
  info: "info",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useTrayNotifications(): void {
  // Обрабатываем конструкцию: const vpnState = useVpnStore((value) => value.status.st….
  const vpnState = useVpnStore((value) => value.status.state);
  // Обрабатываем конструкцию: const updateStatus = useUpdateStore((value) => value.st….
  const updateStatus = useUpdateStore((value) => value.status);
  // Обрабатываем конструкцию: const updateVersion = useUpdateStore((value) => value.i….
  const updateVersion = useUpdateStore((value) => value.info?.latestVersion);
  // Обрабатываем конструкцию: const showUpdate = useSettingsStore( (value) => value.s….
  const showUpdate = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (value) => value.settings.general.showUpdateNotifications
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const showNotifications = useSettingsStore( (value) => ….
  const showNotifications = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (value) => value.settings.general.showNotifications
    // Закрываем выражение или список аргументов.
  );
  // Сохраняем пояснение разработчика: // Канал уведомлений живёт в Rust: тостер решает по этой же …
  // Канал уведомлений живёт в Rust: тостер решает по этой же настройке,
  // Сохраняем пояснение разработчика: // а системные окна Windows показывает только её бэкенд.
  // а системные окна Windows показывает только её бэкенд.
  // Обрабатываем конструкцию: const notificationChannel = useSettingsStore( (value) =….
  const notificationChannel = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (value) => value.settings.general.notificationChannel
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const lastVpnState = useRef<string | null>(null).
  const lastVpnState = useRef<string | null>(null);
  // Обрабатываем конструкцию: const lastUpdate = useRef<string | null>(null).
  const lastUpdate = useRef<string | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: void secureInvoke(set_notification_channel, { channel: ….
    void secureInvoke("set_notification_channel", {
      // Обрабатываем конструкцию: channel.
      channel: notificationChannel,
      // Закрываем текущий блок.
    }).catch(() => undefined);
    // Закрываем текущий блок.
  }, [notificationChannel]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const subscription = listen<string>(NOTIFY_EVENT, (even….
    const subscription = listen<string>(NOTIFY_EVENT, (event) => {
      // Обрабатываем конструкцию: const parsed = parseNotify(event.payload).
      const parsed = parseNotify(event.payload);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: parsed === null.
      if (parsed === null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: useLogsStore.
      useLogsStore.getState().addLog({
        // Обрабатываем конструкцию: level.
        level: KIND_LEVEL[parsed.kind],
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message:
          // Обрабатываем конструкцию: translateKey.
          translateKey("log.notifyTitle", { title: parsed.title }) +
          // Обрабатываем конструкцию: (parsed.body === ? : — ${parsed.body}).
          (parsed.body === "" ? "" : ` — ${parsed.body}`),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { void subscription.then((unlisten) => { unlisten….
    return () => {
      // Обрабатываем конструкцию: void subscription.then((unlisten) => { unlisten(); }).
      void subscription.then((unlisten) => {
        // Обрабатываем конструкцию: unlisten.
        unlisten();
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const previous = lastVpnState.current.
    const previous = lastVpnState.current;
    // Обрабатываем конструкцию: lastVpnState.
    lastVpnState.current = vpnState;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: previous === null || previous === vpnState.
    if (previous === null || previous === vpnState) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: !showNotifications.
    if (!showNotifications) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: vpnState === connected.
    if (vpnState === "connected") {
      // Обрабатываем конструкцию: void emit( translateKey(log.vpnConnectedTitle), transla….
      void emit(
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.vpnConnectedTitle"),
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.vpnConnectedBody"),
        // Обрабатываем конструкцию: success.
        "success"
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    } else if (vpnState === "error") {
      // Обрабатываем конструкцию: void emit( translateKey(log.vpnErrorTitle), translateKe….
      void emit(
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.vpnErrorTitle"),
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.vpnErrorBody"),
        // Обрабатываем конструкцию: error.
        "error"
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    } else if (previous === "connected") {
      // Обрабатываем конструкцию: void emit( translateKey(log.vpnDisconnectedTitle), tran….
      void emit(
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.vpnDisconnectedTitle"),
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.vpnDisconnectedBody"),
        // Обрабатываем конструкцию: info.
        "info"
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [showNotifications, vpnState]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: updateStatus !== available.
    if (updateStatus !== "available") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: updateVersion === undefined || updateVersion === lastUp….
    if (updateVersion === undefined || updateVersion === lastUpdate.current) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const key = updateVersion.
    const key = updateVersion;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: lastUpdate.
    lastUpdate.current = key;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: !showNotifications || !showUpdate.
    if (!showNotifications || !showUpdate) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void emit( translateKey(log.updateAvailableTitle), tran….
    void emit(
      // Обрабатываем конструкцию: translateKey.
      translateKey("log.updateAvailableTitle"),
      // Обрабатываем конструкцию: translateKey.
      translateKey("log.updateAvailableBody", { version: key }),
      // Обрабатываем конструкцию: info.
      "info"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }, [showNotifications, showUpdate, updateStatus, updateVersion]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function emit(
  // Обрабатываем конструкцию: title.
  title: string,
  // Обрабатываем конструкцию: body.
  body: string,
  // Обрабатываем конструкцию: kind.
  kind: NotificationKind
  // Закрываем выражение или список аргументов.
): Promise<void> {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Ожидаем завершение асинхронной операции await secureInvoke(show_notification, { title….
    await secureInvoke("show_notification", { title, body, kind });
    // Закрываем текущий блок.
  } catch (caught) {
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().addLog({
      // Обрабатываем конструкцию: level.
      level: "warn",
      // Обрабатываем конструкцию: source.
      source: "system",
      // Обрабатываем конструкцию: message.
      message: translateKey("log.notifyFailed", {
        // Обрабатываем конструкцию: error.
        error: toErrorMessage(caught),
        // Закрываем текущий блок.
      }),
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
