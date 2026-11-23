// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/types.
import type { NotificationKind, TrayConfig, TrayState } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function updateTrayState(
  // Обрабатываем конструкцию: state.
  state: TrayState,
  // Обрабатываем конструкцию: activeStrategy.
  activeStrategy: string | null,
  // Обрабатываем конструкцию: vpnName.
  vpnName: string | null
  // Закрываем выражение или список аргументов.
): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke(update_tray_state, { updat….
  await secureInvoke("update_tray_state", {
    // Обрабатываем конструкцию: update.
    update: { state, activeStrategy, vpnName },
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function updateTrayConfig(config: TrayConfig): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke(update_tray_config, { conf….
  await secureInvoke("update_tray_config", { config });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function showNotification(
  // Обрабатываем конструкцию: title.
  title: string,
  // Обрабатываем конструкцию: body.
  body: string,
  // Обрабатываем конструкцию: kind.
  kind: NotificationKind
  // Закрываем выражение или список аргументов.
): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke(show_notification, { title….
  await secureInvoke("show_notification", { title, body, kind });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function setMinimizeToTray(value: boolean): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke(set_minimize_to_tray_cmd, ….
  await secureInvoke("set_minimize_to_tray_cmd", { value });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
