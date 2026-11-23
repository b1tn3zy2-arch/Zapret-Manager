// Импортируем зависимости из модуля lucide-react.
import {
  // Подключаем именованный импорт Activity.
  Activity,
  // Подключаем именованный импорт Gamepad2.
  Gamepad2,
  // Подключаем именованный импорт Info.
  Info,
  // Подключаем именованный импорт Layers.
  Layers,
  // Подключаем именованный импорт LayoutDashboard.
  LayoutDashboard,
  // Подключаем именованный импорт ScrollText.
  ScrollText,
  // Подключаем именованный импорт Settings.
  Settings,
  // Подключаем именованный импорт type LucideIcon.
  type LucideIcon,
  // Закрываем текущий блок.
} from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/appearanceTokens.
import { getAnimationSpeedFactor } from "@/lib/appearanceTokens";
// Импортируем зависимости из модуля @/types.
import type { LogLevel, LogSource } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const APP_NAME = "Zapret";
// Обрабатываем конструкцию: export.
export const APP_VERSION = "1.0.2";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const ROUTES = {
  // Обрабатываем конструкцию: dashboard.
  dashboard: "dashboard",
  // Обрабатываем конструкцию: strategies.
  strategies: "strategies",
  // Обрабатываем конструкцию: games.
  games: "games",
  // Обрабатываем конструкцию: monitor.
  monitor: "monitor",
  // Обрабатываем конструкцию: logs.
  logs: "logs",
  // Обрабатываем конструкцию: settings.
  settings: "settings",
  // Обрабатываем конструкцию: about.
  about: "about",
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type AppPage = (typeof ROUTES)[keyof typeof ROUTES];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type DashboardMode = "dpi" | "vpn";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isDashboardMode(value: string): value is DashboardMode {
  // Возвращаем результат: value === dpi || value === vpn.
  return value === "dpi" || value === "vpn";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MODE_CROSSFADE_MS = 400;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const CONNECTION_STATUS = {
  // Обрабатываем конструкцию: connected.
  connected: "connected",
  // Обрабатываем конструкцию: connecting.
  connecting: "connecting",
  // Обрабатываем конструкцию: disconnected.
  disconnected: "disconnected",
  // Обрабатываем конструкцию: vpn.
  vpn: "vpn",
  // Обрабатываем конструкцию: error.
  error: "error",
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type ConnectionStatus =
  // Обрабатываем конструкцию: (typeof CONNECTION_STATUS).
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const CONNECTION_LABELS = {
  // Обрабатываем конструкцию: connected.
  connected: "connection.connected",
  // Обрабатываем конструкцию: connecting.
  connecting: "connection.connecting",
  // Обрабатываем конструкцию: disconnected.
  disconnected: "connection.disconnected",
  // Обрабатываем конструкцию: vpn.
  vpn: "connection.vpn",
  // Обрабатываем конструкцию: error.
  error: "connection.error",
  // Закрываем текущий блок.
} as const satisfies Record<ConnectionStatus, TranslationKey>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface NavItem {
  // Обрабатываем конструкцию: readonly.
  readonly route: AppPage;
  // Обрабатываем конструкцию: readonly.
  readonly labelKey: TranslationKey;
  // Обрабатываем конструкцию: readonly.
  readonly icon: LucideIcon;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const NAV_ITEMS = [
  // Открываем объектный литерал.
  { route: ROUTES.dashboard, labelKey: "nav.dashboard", icon: LayoutDashboard },
  // Открываем объектный литерал.
  { route: ROUTES.strategies, labelKey: "nav.strategies", icon: Layers },
  // Открываем объектный литерал.
  { route: ROUTES.games, labelKey: "nav.games", icon: Gamepad2 },
  // Открываем объектный литерал.
  { route: ROUTES.monitor, labelKey: "nav.monitor", icon: Activity },
  // Открываем объектный литерал.
  { route: ROUTES.logs, labelKey: "nav.logs", icon: ScrollText },
  // Открываем объектный литерал.
  { route: ROUTES.settings, labelKey: "nav.settings", icon: Settings },
  // Открываем объектный литерал.
  { route: ROUTES.about, labelKey: "nav.about", icon: Info },
  // Закрываем массив или список.
] as const satisfies readonly NavItem[];
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ANIMATION_BASE = { fast: 0.15, normal: 0.25, slow….
const ANIMATION_BASE = {
  // Обрабатываем конструкцию: fast.
  fast: 0.15,
  // Обрабатываем конструкцию: normal.
  normal: 0.25,
  // Обрабатываем конструкцию: slow.
  slow: 0.4,
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ANIMATION_EASES = { easeOutExpo: [0.16, 1, 0.3, 1….
const ANIMATION_EASES = {
  // Обрабатываем конструкцию: easeOutExpo.
  easeOutExpo: [0.16, 1, 0.3, 1],
  // Обрабатываем конструкцию: easeInOutExpo.
  easeInOutExpo: [0.87, 0, 0.13, 1],
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const ANIMATION = new Proxy(
  // Открываем объектный литерал.
  { ...ANIMATION_BASE, ...ANIMATION_EASES },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: get.
    get(target, property, receiver): unknown {
      // Обрабатываем конструкцию: const value = Reflect.get(target, property, receiver) a….
      const value = Reflect.get(target, property, receiver) as unknown;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: typeof value === number.
      if (typeof value === "number") {
        // Возвращаем результат: value * getAnimationSpeedFactor().
        return value * getAnimationSpeedFactor();
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Возвращаем результат: value.
      return value;
      // Закрываем текущий блок.
    },
    // Закрываем текущий блок.
  }
  // Закрываем выражение или список аргументов.
) as Readonly<typeof ANIMATION_BASE & typeof ANIMATION_EASES>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const PERF_TARGETS = {
  // Обрабатываем конструкцию: coldStartMs.
  coldStartMs: 1500,
  // Обрабатываем конструкцию: warmStartMs.
  warmStartMs: 800,
  // Обрабатываем конструкцию: fps.
  fps: 60,
  // Обрабатываем конструкцию: ramIdleMb.
  ramIdleMb: 150,
  // Обрабатываем конструкцию: ramActiveMb.
  ramActiveMb: 250,
  // Обрабатываем конструкцию: bundleKb.
  bundleKb: 400,
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const PING_HOSTS = [
  // Открываем объектный литерал.
  { host: "discord.com", label: "Discord" },
  // Открываем объектный литерал.
  { host: "www.youtube.com", label: "YouTube" },
  // Открываем объектный литерал.
  { host: "www.google.com", label: "Google" },
  // Закрываем массив или список.
] as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MONITOR_PING_HISTORY_SIZE = 60;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MONITOR_INTERVAL_MS = 100;
// Обрабатываем конструкцию: export.
export const MONITOR_STATS_REFRESH_MS = 200;
// Обрабатываем конструкцию: export.
export const MONITOR_LABEL_REFRESH_MS = 1000;
// Обрабатываем конструкцию: export.
export const MONITOR_STALL_THRESHOLD_MS = 2000;
// Обрабатываем конструкцию: export.
export const MONITOR_BUFFER_SIZE = 240;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const PING_INTERVAL_MS = 2000;
// Обрабатываем конструкцию: export.
export const PING_HISTORY_SIZE = 30;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const PROCESS_CHECK_INTERVAL_MS = 5000;
// Обрабатываем конструкцию: export.
export const UPTIME_TICK_MS = 1000;
// Обрабатываем конструкцию: export.
export const VIEWPORT_THROTTLE_MS = 100;
// Обрабатываем конструкцию: export.
export const TRAY_UPDATE_THROTTLE_MS = 200;
// Обрабатываем конструкцию: export.
export const LOG_FLUSH_IDLE_TIMEOUT_MS = 100;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const NETWORK_INFO_CACHE_KEY = "zapret-manager:network-info";
// Обрабатываем конструкцию: export.
export const NETWORK_INFO_CACHE_MS = 5 * 60 * 1000;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Кэш email последнего заказа оплаты: вводить его каждый раз у…
/** Кэш email последнего заказа оплаты: вводить его каждый раз утомительно. */
// Обрабатываем конструкцию: export.
export const PAYMENT_EMAIL_CACHE_KEY = "zapret-manager:payment-email";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const UPDATE_CHECK_DELAY_MS = 3000;
// Обрабатываем конструкцию: export.
export const UPDATE_MIN_INTERVAL_HOURS = 1;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Репозиторий zapret: источник стратегий и обновлений.
/** Репозиторий zapret: источник стратегий и обновлений. */
// Обрабатываем конструкцию: export.
export const DEFAULT_GITHUB_REPO = "Flowseal/zapret-discord-youtube";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const TRAFFIC_CHART_HEIGHT = 180;
// Сохраняем пояснение разработчика: Плотность графика. График маленький (180 px в высоту), поэто…
/** Плотность графика. График маленький (180 px в высоту), поэтому даже
 // Сохраняем пояснение разработчика: * редкие 200–250%-масштабы Windows держим целиком: на 2× кар…
 * редкие 200–250%-масштабы Windows держим целиком: на 2× картинка
 // Сохраняем пояснение разработчика: * растягивается композитором и линии теряют резкость.
 * растягивается композитором и линии теряют резкость. */
// Обрабатываем конструкцию: export.
export const TRAFFIC_CHART_MAX_DPR = 3;
// Сохраняем пояснение разработчика: График не нуждается в 60 fps: 30 достаточно для плавной лент…
/** График не нуждается в 60 fps: 30 достаточно для плавной ленты. */
// Обрабатываем конструкцию: export.
export const TRAFFIC_CHART_FRAME_MS = 1000 / 30;
// Обрабатываем конструкцию: export.
export const TRAFFIC_COLORS = {
  // Обрабатываем конструкцию: in.
  in: "#22d3ee",
  // Обрабатываем конструкцию: out.
  out: "#a855f7",
  // Закрываем текущий блок.
} as const;
// Обрабатываем конструкцию: export.
export const TRAFFIC_AXIS_COLOR = "rgba(128, 128, 138, 0.75)";
// Обрабатываем конструкцию: export.
export const TRAFFIC_GRID_COLOR_DARK = "rgba(255, 255, 255, 0.04)";
// Обрабатываем конструкцию: export.
export const TRAFFIC_GRID_COLOR_LIGHT = "rgba(0, 0, 0, 0.06)";
// Обрабатываем конструкцию: export.
export const TRAFFIC_GRID_VERTICAL_DARK = "rgba(255, 255, 255, 0.02)";
// Обрабатываем конструкцию: export.
export const TRAFFIC_GRID_VERTICAL_LIGHT = "rgba(0, 0, 0, 0.03)";
// Обрабатываем конструкцию: export.
export const TRAFFIC_MAX_HEADROOM = 1.2;
// Обрабатываем конструкцию: export.
export const TRAFFIC_MIN_SCALE = 4096;
// Обрабатываем конструкцию: export.
export const EWMA_ALPHA = 0.3;
// Обрабатываем конструкцию: export.
export const CHART_SMOOTH_TENSION = 0.4;
// Обрабатываем конструкцию: export.
export const CHART_PULSE_PERIOD_MS = 2000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MODAL_BACKDROP_BLUR_PX = 24;
// Обрабатываем конструкцию: export.
export const MODAL_BACKDROP_SATURATE = 0.8;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const TOOLTIP_Z_INDEX = 10000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const CARD_ASPECT_RATIO = 0.68;
// Обрабатываем конструкцию: export.
export const CARD_FLIP_DURATION_MS = 600;
// Обрабатываем конструкцию: export.
export const CARD_TILT_SPRING = { stiffness: 200, damping: 20 } as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DASHBOARD_STAGGER_MS = 50;
// Обрабатываем конструкцию: export.
export const DASHBOARD_ITEM_DURATION_MS = 400;
// Обрабатываем конструкцию: export.
export const COUNT_UP_DURATION_MS = 400;
// Обрабатываем конструкцию: export.
export const MONITOR_COUNT_UP_DURATION_MS = 300;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const RESOURCE_PROGRESS_EVENT = "resource-extract-progress";
// Обрабатываем конструкцию: export.
export const STRATEGIES_SUBDIR = "strategies";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const GAME_SCAN_EVENT = "game-scan-progress";
// Обрабатываем конструкцию: export.
export const GAME_COVER_EVENT = "cover-download-progress";
// Обрабатываем конструкцию: export.
export const GAME_SCAN_START_DELAY_MS = 3000;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Страница разового сброса трафика у Maxima VPS (оплата 30 ₽ в…
/** Страница разового сброса трафика у Maxima VPS (оплата 30 ₽ в окне). */
// Обрабатываем конструкцию: export.
export const MAXIMA_TRAFFIC_RESET_URL = "https://maximavps.cloud/traffic-reset";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Предел ожидания сканирования игр: обход диска не должен
/** Предел ожидания сканирования игр: обход диска не должен
 // Сохраняем пояснение разработчика: * висеть в интерфейсе вечно.
 *  висеть в интерфейсе вечно. */
// Обрабатываем конструкцию: export.
export const GAME_SCAN_TIMEOUT_MS = 120_000;
// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Фоновый перескан установленных игр: раз в десять минут при…
 * Фоновый перескан установленных игр: раз в десять минут приложение само
 // Сохраняем пояснение разработчика: * проверяет, не появилась ли новая игра, — руками жать «Найт…
 * проверяет, не появилась ли новая игра, — руками жать «Найти» не нужно.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export const GAME_AUTORESCAN_INTERVAL_MS = 10 * 60 * 1000;
// Обрабатываем конструкцию: export.
export const GAME_LAUNCH_HIDE_DELAY_MS = 500;
// Обрабатываем конструкцию: export.
export const GAME_CARD_TILT_MAX = 14;
// Обрабатываем конструкцию: export.
export const GAME_CARD_HOVER_SCALE = 1.05;
// Обрабатываем конструкцию: export.
export const GAME_CARD_MIN_WIDTH_PX = 180;
// Обрабатываем конструкцию: export.
export const GAME_CARD_MAX_WIDTH_PX = 240;
// Обрабатываем конструкцию: export.
export const GAME_CARD_LIFT_SHADOW =
  // Обрабатываем конструкцию: 0 24px 48px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(var(--colo….
  "0 24px 48px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(var(--color-accent-primary-rgb) / 0.25)";
// Сохраняем пояснение разработчика: /// Свечение карточки запущенной стратегии: приподнята и под…
/// Свечение карточки запущенной стратегии: приподнята и подсвечена даже
// Сохраняем пояснение разработчика: /// без наведения — состояние «работает» видно с первого взг…
/// без наведения — состояние «работает» видно с первого взгляда.
// Обрабатываем конструкцию: export.
export const RUNNING_CARD_SHADOW =
  // Обрабатываем конструкцию: 0 18px 40px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(var(--colo….
  "0 18px 40px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(var(--color-accent-primary-rgb) / 0.5), 0 0 28px rgb(var(--color-accent-primary-rgb) / 0.3)";
// Обрабатываем конструкцию: export.
export const GAME_COVER_ASPECT = "3 / 4";
// Обрабатываем конструкцию: export.
export const GAME_LAUNCH_TOAST_MS = 2500;
// Обрабатываем конструкцию: export.
export const GAME_LAUNCH_CHECK_MS = 2000;
// Сохраняем пояснение разработчика: /// Как часто сверяется, жива ли запущенная игра (по дереву …
/// Как часто сверяется, жива ли запущенная игра (по дереву процессов).
// Обрабатываем конструкцию: export.
export const GAME_LAUNCH_POLL_MS = 5000;
// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * «Быстрый» провал запуска: если игра с обходом закрылась ра…
 * «Быстрый» провал запуска: если игра с обходом закрылась раньше этого
 // Сохраняем пояснение разработчика: * срока, скорее всего обход не справился (античит выгнал, се…
 * срока, скорее всего обход не справился (античит выгнал, сеть легла).
 // Сохраняем пояснение разработчика: * При следующем запуске приложение предложит VPN вместо обхо…
 * При следующем запуске приложение предложит VPN вместо обхода.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export const GAME_FAST_EXIT_MS = 90_000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const RECENT_LOGS_COUNT = 5;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SPARKLINE_HEIGHT = 32;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const LOG_ROW_HEIGHT = 32;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const NOTIFY_EVENT = "app-notification";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const UPDATE_MAX_INTERVAL_HOURS = 168;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const UPDATE_UNKNOWN_VERSION = "unknown";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const LOG_OVERSCAN = 10;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SEARCH_DEBOUNCE_MS = 200;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const COPY_TOAST_DURATION_MS = 1500;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const AUTOSCROLL_THRESHOLD_PX = 50;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const LOG_LEVELS = [
  // Обрабатываем конструкцию: debug.
  "debug",
  // Обрабатываем конструкцию: info.
  "info",
  // Обрабатываем конструкцию: success.
  "success",
  // Обрабатываем конструкцию: warn.
  "warn",
  // Обрабатываем конструкцию: error.
  "error",
  // Закрываем массив или список.
] as const satisfies readonly LogLevel[];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const LOG_SOURCES = [
  // Обрабатываем конструкцию: system.
  "system",
  // Обрабатываем конструкцию: strategy.
  "strategy",
  // Обрабатываем конструкцию: user.
  "user",
  // Обрабатываем конструкцию: vpn.
  "vpn",
  // Закрываем массив или список.
] as const satisfies readonly LogSource[];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const LOG_LEVEL_LABELS = {
  // Обрабатываем конструкцию: debug.
  debug: "logs.levels.debug",
  // Обрабатываем конструкцию: info.
  info: "logs.levels.info",
  // Обрабатываем конструкцию: success.
  success: "logs.levels.success",
  // Обрабатываем конструкцию: warn.
  warn: "logs.levels.warn",
  // Обрабатываем конструкцию: error.
  error: "logs.levels.error",
  // Закрываем текущий блок.
} as const satisfies Record<LogLevel, TranslationKey>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const LOG_SOURCE_LABELS = {
  // Обрабатываем конструкцию: system.
  system: "logs.sources.system",
  // Обрабатываем конструкцию: strategy.
  strategy: "logs.sources.strategy",
  // Обрабатываем конструкцию: user.
  user: "logs.sources.user",
  // Обрабатываем конструкцию: vpn.
  vpn: "logs.sources.vpn",
  // Закрываем текущий блок.
} as const satisfies Record<LogSource, TranslationKey>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const LOG_LEVEL_CLASSES = {
  // Обрабатываем конструкцию: debug.
  debug: "text-text-tertiary",
  // Обрабатываем конструкцию: info.
  info: "text-text-primary",
  // Обрабатываем конструкцию: success.
  success: "text-accent-primary",
  // Обрабатываем конструкцию: warn.
  warn: "text-accent-warning",
  // Обрабатываем конструкцию: error.
  error: "text-accent-danger",
  // Закрываем текущий блок.
} as const satisfies Record<LogLevel, string>;
// — разделитель логических блоков —
