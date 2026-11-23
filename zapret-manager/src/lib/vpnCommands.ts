// Импортируем зависимости из модуля @/types/ipcSchemas.
import {
  // Подключаем именованный импорт AutoConnectReportSchema.
  AutoConnectReportSchema,
  // Подключаем именованный импорт CreatedOrderSchema.
  CreatedOrderSchema,
  // Подключаем именованный импорт SubscriptionInfoSchema.
  SubscriptionInfoSchema,
  // Подключаем именованный импорт TariffMatrixSchema.
  TariffMatrixSchema,
  // Подключаем именованный импорт VpnConfigInfoSchema.
  VpnConfigInfoSchema,
  // Подключаем именованный импорт VpnStatsSchema.
  VpnStatsSchema,
  // Подключаем именованный импорт VpnStatusSchema.
  VpnStatusSchema,
  // Подключаем именованный импорт XrayStatusSchema.
  XrayStatusSchema,
  // Закрываем текущий блок.
} from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke, secureInvokeValidated } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля zod.
import { z } from "zod";
// Импортируем зависимости из модуля @/types.
import type {
  // Подключаем именованный импорт AutoConnectReport.
  AutoConnectReport,
  // Подключаем именованный импорт CreatedOrder.
  CreatedOrder,
  // Подключаем именованный импорт SubscriptionInfo.
  SubscriptionInfo,
  // Подключаем именованный импорт TariffMatrix.
  TariffMatrix,
  // Подключаем именованный импорт VpnConfigInfo.
  VpnConfigInfo,
  // Подключаем именованный импорт VpnStats.
  VpnStats,
  // Подключаем именованный импорт VpnStatus.
  VpnStatus,
  // Подключаем именованный импорт XrayStatus.
  XrayStatus,
  // Закрываем текущий блок.
} from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function isWireguardInstalled(): Promise<boolean> {
  // Возвращаем результат: secureInvoke<boolean>(is_wireguard_installed).
  return secureInvoke<boolean>("is_wireguard_installed");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function listConfigs(): Promise<VpnConfigInfo[]> {
  // Возвращаем результат: await secureInvokeValidated( list_vpn_configs, VpnConfi….
  return await secureInvokeValidated(
    // Обрабатываем конструкцию: list_vpn_configs.
    "list_vpn_configs",
    // Обрабатываем конструкцию: VpnConfigInfoSchema.
    VpnConfigInfoSchema.array()
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function removeConfig(id: string): Promise<boolean> {
  // Возвращаем результат: secureInvoke<boolean>(delete_vpn_config, { id }).
  return secureInvoke<boolean>("delete_vpn_config", { id });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function importConfig(sourcePath: string): Promise<VpnConfigInfo> {
  // Возвращаем результат: secureInvokeValidated(import_vpn_config, VpnConfigInfoS….
  return secureInvokeValidated("import_vpn_config", VpnConfigInfoSchema, {
    // Передаём поле sourcePath в объект.
    sourcePath,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function fetchStatus(): Promise<VpnStatus> {
  // Обрабатываем конструкцию: const status = await secureInvokeValidated(get_vpn_stat….
  const status = await secureInvokeValidated("get_vpn_status", VpnStatusSchema);
  // — разделитель логических блоков —

  // Возвращаем результат: { ...status, state: status.state as VpnStatus[state] }.
  return { ...status, state: status.state as VpnStatus["state"] };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function fetchStats(): Promise<VpnStats> {
  // Возвращаем результат: secureInvokeValidated(get_vpn_stats, VpnStatsSchema).
  return secureInvokeValidated("get_vpn_stats", VpnStatsSchema);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function reconcileTunnels(): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke<number>(reconcile_vpn_tunn….
  await secureInvoke<number>("reconcile_vpn_tunnels");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function installVpnCore(): Promise<boolean> {
  // Возвращаем результат: secureInvoke<boolean>(install_vpn_core).
  return secureInvoke<boolean>("install_vpn_core");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function fetchVpnCoreStatus(): Promise<XrayStatus> {
  // Возвращаем результат: secureInvokeValidated(vpn_core_status, XrayStatusSchema….
  return secureInvokeValidated("vpn_core_status", XrayStatusSchema);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function disconnectVpnServer(): Promise<XrayStatus> {
  // Возвращаем результат: secureInvoke<XrayStatus>(disconnect_vpn_server).
  return secureInvoke<XrayStatus>("disconnect_vpn_server");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Умное подключение: замеряет отклик до всех серверов, выбир…
 * Умное подключение: замеряет отклик до всех серверов, выбирает
 // Сохраняем пояснение разработчика: * самый быстрый и поднимает на нём туннель. Если серверы не
 * самый быстрый и поднимает на нём туннель. Если серверы не
 // Сохраняем пояснение разработчика: * отвечают, приходит ошибка с кодом NO_AVAILABLE_SERVERS.
 * отвечают, приходит ошибка с кодом `NO_AVAILABLE_SERVERS`.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function autoConnectVpn(): Promise<AutoConnectReport> {
  // Возвращаем результат: secureInvokeValidated(auto_connect_vpn, AutoConnectRepo….
  return secureInvokeValidated("auto_connect_vpn", AutoConnectReportSchema);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Сохранённый снимок подписки: трафик, срок и признак активнос…
/** Сохранённый снимок подписки: трафик, срок и признак активности.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Читает только то, что уже лежит на диске: карточка не ждёт…
 * Читает только то, что уже лежит на диске: карточка не ждёт сеть.
 // Сохраняем пояснение разработчика: * Свежие данные приходят командой refresh_subscription.
 * Свежие данные приходят командой `refresh_subscription`.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function getSubscription(): Promise<SubscriptionInfo> {
  // Возвращаем результат: secureInvokeValidated(get_subscription, SubscriptionInf….
  return secureInvokeValidated("get_subscription", SubscriptionInfoSchema);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Тарифы и полная матрица цен, посчитанная в Rust.
/** Тарифы и полная матрица цен, посчитанная в Rust. */
// Обрабатываем конструкцию: export.
export async function fetchTariffMatrix(): Promise<TariffMatrix> {
  // Возвращаем результат: secureInvokeValidated(fetch_tariff_matrix, TariffMatrix….
  return secureInvokeValidated("fetch_tariff_matrix", TariffMatrixSchema);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Создаёт свежий заказ оплаты.
 * Создаёт свежий заказ оплаты.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Ссылки на оплату живут недолго: платёжная система закрывае…
 * Ссылки на оплату живут недолго: платёжная система закрывает
 // Сохраняем пояснение разработчика: * неиспользованный заказ по таймауту, поэтому заказ создаётс…
 * неиспользованный заказ по таймауту, поэтому заказ создаётся при
 // Сохраняем пояснение разработчика: * каждом клике — ссылка всегда свежая, а сумма всегда актуал…
 * каждом клике — ссылка всегда свежая, а сумма всегда актуальная.
 // Сохраняем пояснение разработчика: * Email обязателен: панель присылает на него ссылку подписки…
 * Email обязателен: панель присылает на него ссылку подписки.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function createPaymentOrder(
  // Обрабатываем конструкцию: plan.
  plan: string,
  // Обрабатываем конструкцию: devices.
  devices: number,
  // Обрабатываем конструкцию: email.
  email: string
  // Закрываем выражение или список аргументов.
): Promise<CreatedOrder> {
  // Возвращаем результат: secureInvokeValidated( create_payment_order_command, Cr….
  return secureInvokeValidated(
    // Обрабатываем конструкцию: create_payment_order_command.
    "create_payment_order_command",
    // Обрабатываем конструкцию: CreatedOrderSchema.
    CreatedOrderSchema,
    // Открываем объектный литерал.
    {
      // Передаём поле plan в объект.
      plan,
      // Передаём поле devices в объект.
      devices,
      // Передаём поле email в объект.
      email,
      // Закрываем текущий блок.
    }
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Добавляет ссылку на подписку и сразу проверяет её.
/** Добавляет ссылку на подписку и сразу проверяет её. */
// Обрабатываем конструкцию: export.
export async function addSubscription(url: string): Promise<SubscriptionInfo> {
  // Возвращаем результат: secureInvokeValidated(add_subscription, SubscriptionInf….
  return secureInvokeValidated("add_subscription", SubscriptionInfoSchema, {
    // Передаём поле url в объект.
    url,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Обновляет метаданные сохранённой подписки.
/** Обновляет метаданные сохранённой подписки. */
// Обрабатываем конструкцию: export.
export async function refreshSubscription(): Promise<SubscriptionInfo> {
  // Возвращаем результат: secureInvokeValidated(refresh_subscription, Subscriptio….
  return secureInvokeValidated("refresh_subscription", SubscriptionInfoSchema);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Удаляет сохранённую ссылку и снимок подписки.
/** Удаляет сохранённую ссылку и снимок подписки. */
// Обрабатываем конструкцию: export.
export async function removeSubscription(): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke(remove_subscription).
  await secureInvoke("remove_subscription");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Предзагружает список серверов из подписки.
/** Предзагружает список серверов из подписки. */
// Обрабатываем конструкцию: export.
export async function prepareSubscriptionServers(): Promise<number> {
  // Возвращаем результат: secureInvoke<number>(prepare_subscription_servers).
  return secureInvoke<number>("prepare_subscription_servers");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Открывает сайт оплаты в отдельном окне приложения.
 * Открывает сайт оплаты в отдельном окне приложения.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Заголовок окна и загрузочная плашка — локализованные: окно…
 * Заголовок окна и загрузочная плашка — локализованные: окно живёт
 // Сохраняем пояснение разработчика: * без capability приложения, текстов i18n у него самого нет.
 * без capability приложения, текстов i18n у него самого нет.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function openPaymentWindow(
  // Обрабатываем конструкцию: url.
  url: string,
  // Обрабатываем конструкцию: title.
  title?: string
  // Закрываем выражение или список аргументов.
): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke(open_payment_window, { url….
  await secureInvoke("open_payment_window", { url, title });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Текущий адрес окна оплаты.
 * Текущий адрес окна оплаты.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * null — окна нет: оно закрыто, следить больше не за чем. Фр…
 * null — окна нет: оно закрыто, следить больше не за чем. Фронт
 // Сохраняем пояснение разработчика: * опрашивает адрес на фоне: подписка, которую сайт показывае…
 * опрашивает адрес на фоне: подписка, которую сайт показывает сразу
 // Сохраняем пояснение разработчика: * после платежа, подхватывается автоматически.
 * после платежа, подхватывается автоматически.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function paymentWindowUrl(): Promise<string | null> {
  // Возвращаем результат: secureInvokeValidated(payment_window_url, z.string().nu….
  return secureInvokeValidated("payment_window_url", z.string().nullable(), {});
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Поиск ссылки подписки в HTML личного кабинета Maxima.
 * Поиск ссылки подписки в HTML личного кабинета Maxima.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Страховка автодобавления: если после платежа сайт открывае…
 * Страховка автодобавления: если после платежа сайт открывает кабинет
 // Сохраняем пояснение разработчика: * с autologin, токен подписки обычно прошит в начальную разм…
 * с autologin, токен подписки обычно прошит в начальную разметку —
 // Сохраняем пояснение разработчика: * backend его достаёт и возвращает готовую ссылку.
 * backend его достаёт и возвращает готовую ссылку.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function findSubscriptionInMaximaPage(
  // Обрабатываем конструкцию: url.
  url: string
  // Закрываем выражение или список аргументов.
): Promise<string | null> {
  // Возвращаем результат: secureInvokeValidated( find_subscription_in_maxima_page….
  return secureInvokeValidated(
    // Обрабатываем конструкцию: find_subscription_in_maxima_page.
    "find_subscription_in_maxima_page",
    // Обрабатываем конструкцию: z.
    z.string().nullable(),
    // Открываем объектный литерал.
    { url }
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface VpnRunResult {
  // Обрабатываем конструкцию: pid.
  pid: number;
  // Обрабатываем конструкцию: logPath.
  logPath: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function runStrategy(
  // Обрабатываем конструкцию: strategyId.
  strategyId: string,
  // Обрабатываем конструкцию: path.
  path: string
  // Закрываем выражение или список аргументов.
): Promise<VpnRunResult> {
  // Возвращаем результат: secureInvoke<VpnRunResult>(run_strategy, { strategyId, ….
  return secureInvoke<VpnRunResult>("run_strategy", { strategyId, path });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function connect(
  // Обрабатываем конструкцию: configId.
  configId: string,
  // Обрабатываем конструкцию: enableKillSwitch.
  enableKillSwitch: boolean,
  // Обрабатываем конструкцию: handshakeTimeoutSec.
  handshakeTimeoutSec: number
  // Закрываем выражение или список аргументов.
): Promise<VpnStatus> {
  // Обрабатываем конструкцию: const status = await secureInvokeValidated(switch_to_vp….
  const status = await secureInvokeValidated("switch_to_vpn", VpnStatusSchema, {
    // Передаём поле configId в объект.
    configId,
    // Передаём поле enableKillSwitch в объект.
    enableKillSwitch,
    // Передаём поле handshakeTimeoutSec в объект.
    handshakeTimeoutSec,
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Возвращаем результат: { ...status, state: status.state as VpnStatus[state] }.
  return { ...status, state: status.state as VpnStatus["state"] };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function disconnect(): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke<null>(disconnect_vpn).
  await secureInvoke<null>("disconnect_vpn");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function switchBackToDpi(): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke<null>(switch_to_dpi).
  await secureInvoke<null>("switch_to_dpi");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
