import {
  Activity,
  Gamepad2,
  Info,
  Layers,
  LayoutDashboard,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { TranslationKey } from "@/i18n/types";
import { getAnimationSpeedFactor } from "@/lib/appearanceTokens";
import type { LogLevel, LogSource } from "@/types";

export const APP_NAME = "Zapret";
export const APP_VERSION = "0.1.0";

export const ROUTES = {
  dashboard: "dashboard",
  strategies: "strategies",
  games: "games",
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
  connected: "connection.connected",
  connecting: "connection.connecting",
  disconnected: "connection.disconnected",
  vpn: "connection.vpn",
  error: "connection.error",
} as const satisfies Record<ConnectionStatus, TranslationKey>;

export interface NavItem {
  readonly route: AppPage;
  readonly labelKey: TranslationKey;
  readonly icon: LucideIcon;
}

export const NAV_ITEMS = [
  { route: ROUTES.dashboard, labelKey: "nav.dashboard", icon: LayoutDashboard },
  { route: ROUTES.strategies, labelKey: "nav.strategies", icon: Layers },
  { route: ROUTES.games, labelKey: "nav.games", icon: Gamepad2 },
  { route: ROUTES.monitor, labelKey: "nav.monitor", icon: Activity },
  { route: ROUTES.logs, labelKey: "nav.logs", icon: ScrollText },
  { route: ROUTES.settings, labelKey: "nav.settings", icon: Settings },
  { route: ROUTES.about, labelKey: "nav.about", icon: Info },
] as const satisfies readonly NavItem[];

const ANIMATION_BASE = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;

const ANIMATION_EASES = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInOutExpo: [0.87, 0, 0.13, 1],
} as const;

export const ANIMATION = new Proxy(
  { ...ANIMATION_BASE, ...ANIMATION_EASES },
  {
    get(target, property, receiver): unknown {
      const value = Reflect.get(target, property, receiver) as unknown;

      if (typeof value === "number") {
        return value * getAnimationSpeedFactor();
      }

      return value;
    },
  }
) as Readonly<typeof ANIMATION_BASE & typeof ANIMATION_EASES>;

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

export const MONITOR_INTERVAL_MS = 50;
export const MONITOR_STATS_REFRESH_MS = 200;
export const MONITOR_LABEL_REFRESH_MS = 1000;
export const MONITOR_STALL_THRESHOLD_MS = 2000;
export const MONITOR_BUFFER_SIZE = 120;

export const PING_INTERVAL_MS = 2000;
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
export const TRAFFIC_AXIS_COLOR = "rgba(128, 128, 138, 0.75)";
export const TRAFFIC_GRID_COLOR_DARK = "rgba(255, 255, 255, 0.04)";
export const TRAFFIC_GRID_COLOR_LIGHT = "rgba(0, 0, 0, 0.06)";
export const TRAFFIC_GRID_VERTICAL_DARK = "rgba(255, 255, 255, 0.02)";
export const TRAFFIC_GRID_VERTICAL_LIGHT = "rgba(0, 0, 0, 0.03)";
export const TRAFFIC_MAX_HEADROOM = 1.2;
export const TRAFFIC_MIN_SCALE = 4096;
export const EWMA_ALPHA = 0.3;
export const CHART_SMOOTH_TENSION = 0.4;
export const CHART_PULSE_PERIOD_MS = 2000;

export const MODAL_BACKDROP_BLUR_PX = 24;
export const MODAL_BACKDROP_SATURATE = 0.8;

export const POST_PROCESSING_LAYER_Z = 9998;
export const GRAIN_TURBULENCE_FREQUENCY = 0.8;
export const GRAIN_TURBULENCE_OCTAVES = 4;
export const BLOOM_DEFAULT_INTENSITY = "subtle";

export const CARD_ASPECT_RATIO = 0.68;
export const CARD_FLIP_DURATION_MS = 600;
export const CARD_TILT_SPRING = { stiffness: 200, damping: 20 } as const;

export const DASHBOARD_STAGGER_MS = 50;
export const DASHBOARD_ITEM_DURATION_MS = 400;
export const COUNT_UP_DURATION_MS = 400;
export const MONITOR_COUNT_UP_DURATION_MS = 300;

export const RESOURCE_PROGRESS_EVENT = "resource-progress";
export const STRATEGIES_SUBDIR = "strategies";

export const GAME_SCAN_EVENT = "game-scan-progress";
export const GAME_SCAN_START_DELAY_MS = 3000;
export const GAME_LAUNCH_HIDE_DELAY_MS = 500;
export const GAME_CARD_TILT_MAX = 14;
export const GAME_CARD_HOVER_SCALE = 1.05;
export const GAME_CARD_MIN_WIDTH_PX = 180;
export const GAME_CARD_MAX_WIDTH_PX = 240;
export const GAME_CARD_LIFT_SHADOW =
  "0 24px 48px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(var(--color-accent-primary-rgb) / 0.25)";
export const GAME_OVERLAY_SCRIM =
  "rgb(0 0 0 / 0.62) 0%, rgb(0 0 0 / 0.28) 45%, transparent 78%";
export const GAME_COVER_ASPECT = "3 / 4";
export const GAME_LAUNCH_TOAST_MS = 2500;
export const GAME_LAUNCH_CHECK_MS = 2000;
/// Как часто сверяется, жива ли запущенная игра (по дереву процессов).
export const GAME_LAUNCH_POLL_MS = 5000;

export const RECENT_LOGS_COUNT = 5;

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

export const LOG_SOURCES = [
  "system",
  "strategy",
  "user",
  "vpn",
] as const satisfies readonly LogSource[];

export const LOG_LEVEL_LABELS = {
  debug: "logs.levels.debug",
  info: "logs.levels.info",
  success: "logs.levels.success",
  warn: "logs.levels.warn",
  error: "logs.levels.error",
} as const satisfies Record<LogLevel, TranslationKey>;

export const LOG_SOURCE_LABELS = {
  system: "logs.sources.system",
  strategy: "logs.sources.strategy",
  user: "logs.sources.user",
  vpn: "logs.sources.vpn",
} as const satisfies Record<LogSource, TranslationKey>;

export const LOG_LEVEL_CLASSES = {
  debug: "text-text-tertiary",
  info: "text-text-primary",
  success: "text-accent-primary",
  warn: "text-accent-warning",
  error: "text-accent-danger",
} as const satisfies Record<LogLevel, string>;
