import { DEFAULT_GITHUB_REPO } from "@/lib/constants";
import { getDefaultGames } from "@/lib/defaultGames";

export const SETTINGS_FILE_NAME = "settings.json";
export const SETTINGS_SYNC_DEBOUNCE_MS = 400;
import type {
  AdvancedSettings,
  AppearanceSettings,
  AppSettings,
  GameSettings,
  GeneralSettings,
  PostProcessingSettings,
  StrategyUpdateSettings,
  VpnSettings,
} from "@/types";

export const DEFAULT_GAMES: GameSettings[] = getDefaultGames();

export const DEFAULT_VPN: VpnSettings = {
  enabled: false,
  provider: "wireguard",
  configPath: "",
  autoConnect: false,
  killSwitch: false,
  activeConfigId: null,
  autoConnectOnStart: false,
  handshakeTimeoutSec: 15,
  lastConnectedAt: null,
};

export const DEFAULT_GENERAL: GeneralSettings = {
  language: "ru",
  autoStart: false,
  minimizeToTray: true,
  startMinimized: false,
  showNotifications: true,
  showNotificationsOnStart: false,
  showNotificationsOnStop: false,
  showUpdateNotifications: true,
};

export const DEFAULT_POST_PROCESSING: PostProcessingSettings = {
  bloom: "normal",
  vignette: "subtle",
  filmGrain: false,
  scanlines: false,
  chromaticAberration: true,
  motionBlur: true,
  globalQuality: "high",
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "dark",
  density: "normal",
  animations: true,
  reduceMotion: true,
  animateTrayIcon: true,
  postProcessing: DEFAULT_POST_PROCESSING,
};

export const DEFAULT_ADVANCED: AdvancedSettings = {
  loggingLevel: "info",
  logRetentionDays: 7,
  strategyStartTimeoutSec: 15,
  strategyStopTimeoutSec: 10,
  winwsExtraArgs: [],
  disableUpdateCheck: false,
};

export const DEFAULT_LOG_BUFFER_SIZE = 10_000;

export const DEFAULT_STRATEGY_UPDATES: StrategyUpdateSettings = {
  autoCheck: true,
  checkIntervalHours: 24,
  autoDownload: false,
  githubRepo: DEFAULT_GITHUB_REPO,
  ignoredVersions: [],
  lastCheckAt: null,
};

export const DEFAULT_SETTINGS: AppSettings = {
  strategiesFolder: "",
  lastStrategyId: null,
  general: DEFAULT_GENERAL,
  appearance: DEFAULT_APPEARANCE,
  strategyUpdates: DEFAULT_STRATEGY_UPDATES,
  games: DEFAULT_GAMES,
  vpn: DEFAULT_VPN,
  advanced: DEFAULT_ADVANCED,
};
