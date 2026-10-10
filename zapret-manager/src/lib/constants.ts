import {
  Activity,
  Info,
  Layers,
  LayoutDashboard,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { LogLevel, LogSource } from "@/types";

export const APP_NAME = "Zapret Manager";
export const APP_VERSION = "0.1.0";

export const ROUTES = {
  dashboard: "dashboard",
  strategies: "strategies",
  monitor: "monitor",
  logs: "logs",
  settings: "settings",
  about: "about",
} as const;

export type AppPage = (typeof ROUTES)[keyof typeof ROUTES];

export type DashboardMode = "dpi" | "vpn";

export function isDashboardMode(value: string): value is DashboardMode {
  return value === "dpi" || value === "vpn";
}

export const VPN_PING_INTERVAL_MS = 30_000;

export const MODE_CROSSFADE_MS = 400;

export const CONNECTION_STATUS = {
  connected: "connected",
  connecting: "connecting",
  disconnected: "disconnected",
  vpn: "vpn",
  error: "error",
} as const;

export type ConnectionStatus =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

export const CONNECTION_LABELS = {
  connected: "Подключено",
  connecting: "Подключение",
  disconnected: "Отключено",
  vpn: "VPN",
  error: "Ошибка",
} as const satisfies Record<ConnectionStatus, string>;

export interface NavItem {
  readonly route: AppPage;
  readonly label: string;
  readonly icon: LucideIcon;
}

export const NAV_ITEMS = [
  { route: ROUTES.dashboard, label: "Главная", icon: LayoutDashboard },
  { route: ROUTES.strategies, label: "Стратегии", icon: Layers },
  { route: ROUTES.monitor, label: "Монитор", icon: Activity },
  { route: ROUTES.logs, label: "Логи", icon: ScrollText },
  { route: ROUTES.settings, label: "Настройки", icon: Settings },
  { route: ROUTES.about, label: "О приложении", icon: Info },
] as const satisfies readonly NavItem[];

export const ANIMATION = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInOutExpo: [0.87, 0, 0.13, 1],
} as const;

export const PERF_TARGETS = {
  coldStartMs: 1500,
  warmStartMs: 800,
  fps: 60,
  ramIdleMb: 150,
  ramActiveMb: 250,
  bundleKb: 400,
} as const;

export const PING_HOSTS = [
  { host: "discord.com", label: "Discord" },
  { host: "www.youtube.com", label: "YouTube" },
  { host: "www.google.com", label: "Google" },
] as const;

export const MONITOR_PING_HISTORY_SIZE = 60;

export const MONITOR_INTERVAL_MS = 100;
export const MONITOR_STATS_REFRESH_MS = 200;
export const MONITOR_LABEL_REFRESH_MS = 1000;
export const MONITOR_STALL_THRESHOLD_MS = 2000;
export const MONITOR_BUFFER_SIZE = 120;

export const PING_INTERVAL_MS = 5000;
export const PING_HISTORY_SIZE = 30;

export const PROCESS_CHECK_INTERVAL_MS = 5000;
export const UPTIME_TICK_MS = 1000;
export const VIEWPORT_THROTTLE_MS = 100;
export const TRAY_UPDATE_THROTTLE_MS = 200;
export const LOG_FLUSH_IDLE_TIMEOUT_MS = 100;

export const NETWORK_INFO_CACHE_KEY = "zapret-manager:network-info";
export const NETWORK_INFO_CACHE_MS = 5 * 60 * 1000;

export const UPDATE_CHECK_DELAY_MS = 3000;
export const UPDATE_MIN_INTERVAL_HOURS = 6;

/** Репозиторий zapret: источник стратегий и обновлений. */
export const DEFAULT_GITHUB_REPO = "Flowseal/zapret-discord-youtube";

export const TRAFFIC_CHART_HEIGHT = 180;
export const TRAFFIC_COLORS = {
  in: "#22d3ee",
  out: "#a855f7",
} as const;
export const TRAFFIC_AXIS_COLOR = "rgba(161, 161, 170, 0.6)";
export const TRAFFIC_GRID_COLOR = "rgba(255, 255, 255, 0.06)";
export const TRAFFIC_MAX_HEADROOM = 1.2;
export const TRAFFIC_MIN_SCALE = 4096;
export const EWMA_ALPHA = 0.3;

export const MODAL_BACKDROP_BLUR_PX = 24;
export const MODAL_BACKDROP_SATURATE = 0.8;

export const POST_PROCESSING_LAYER_Z = 9998;
export const GRAIN_TURBULENCE_FREQUENCY = 0.8;
export const GRAIN_TURBULENCE_OCTAVES = 4;
export const BLOOM_DEFAULT_INTENSITY = "subtle";

export const CARD_ASPECT_RATIO = 0.68;
export const CARD_FLIP_DURATION_MS = 600;
export const CARD_DEAL_DURATION_MS = 400;
export const CARD_DEAL_STAGGER_MS = 50;
export const CARD_TILT_CARD_LIMIT = 12;
export const CARD_TILT_SPRING = { stiffness: 200, damping: 20 } as const;

export const RESOURCE_PROGRESS_EVENT = "resource-progress";
export const STRATEGIES_SUBDIR = "strategies";

export const RECENT_LOGS_COUNT = 5;

export const SPARKLINE_WIDTH = 120;

export const SPARKLINE_HEIGHT = 32;

export const LOG_ROW_HEIGHT = 32;

export const NOTIFY_EVENT = "app-notification";

export const UPDATE_MAX_INTERVAL_HOURS = 168;

export const UPDATE_UNKNOWN_VERSION = "unknown";

export const LOG_OVERSCAN = 10;

export const SEARCH_DEBOUNCE_MS = 200;

export const COPY_TOAST_DURATION_MS = 1500;

export const AUTOSCROLL_THRESHOLD_PX = 50;

export const LOG_LEVELS = [
  "debug",
  "info",
  "success",
  "warn",
  "error",
] as const satisfies readonly LogLevel[];

export const LOG_LEVEL_VALUES = [
  "debug",
  "info",
  "warn",
  "error",
] as const satisfies readonly LogLevel[];

export const LOG_SOURCES = [
  "system",
  "strategy",
  "user",
  "vpn",
] as const satisfies readonly LogSource[];

export const LOG_LEVEL_LABELS = {
  debug: "отладка",
  info: "инфо",
  success: "успешно",
  warn: "предупреждение",
  error: "ошибка",
} as const satisfies Record<LogLevel, string>;

export const LOG_SOURCE_LABELS = {
  system: "система",
  strategy: "стратегия",
  user: "пользователь",
  vpn: "VPN",
} as const satisfies Record<LogSource, string>;

export const LOG_LEVEL_CLASSES = {
  debug: "text-text-tertiary",
  info: "text-text-primary",
  success: "text-accent-primary",
  warn: "text-amber-400",
  error: "text-red-400",
} as const satisfies Record<LogLevel, string>;

export const LOG_LEVEL_DOT_CLASSES = {
  debug: "bg-text-tertiary",
  info: "bg-text-primary",
  success: "bg-accent-primary",
  warn: "bg-amber-400",
  error: "bg-red-400",
} as const satisfies Record<LogLevel, string>;
