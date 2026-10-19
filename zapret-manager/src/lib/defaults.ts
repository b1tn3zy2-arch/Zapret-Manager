import { DEFAULT_GITHUB_REPO } from "@/lib/constants";
import { getDefaultGames } from "@/lib/defaultGames";

export const SETTINGS_FILE_NAME = "settings.json";
export const SETTINGS_SYNC_DEBOUNCE_MS = 400;
import type {
  AdvancedSettings,
  AppearanceSettings,
  AppSettings,
  FlameSettings,
  GameSettings,
  GeneralSettings,
  PostProcessingSettings,
  StrategyUpdateSettings,
  VpnSettings,
} from "@/types";

export const DEFAULT_GAMES: GameSettings[] = getDefaultGames();

export const DEFAULT_VPN: VpnSettings = {
  // Раздел VPN на главной странице работает на ядре Xray и не зависит от
  // старого WireGuard-стека. По умолчанию он должен быть включён, иначе
  // кнопка подключения была бы заблокирована сразу после установки.
  enabled: true,
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
  enableLogs: true,
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

export const DEFAULT_FLAME: FlameSettings = {
  enabled: false,
  intensity: "normal",
  speed: "normal",
  chromatic: true,
  forceOn: false,
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "dark",
  density: "normal",
  interfaceScale: 100,
  animationSpeed: 100,
  animations: true,
  animateTrayIcon: true,
  postProcessing: DEFAULT_POST_PROCESSING,
  flame: DEFAULT_FLAME,
};

export const DEFAULT_ADVANCED: AdvancedSettings = {
  loggingLevel: "info",
  logRetentionDays: 7,
  strategyStartTimeoutSec: 15,
  strategyStopTimeoutSec: 10,
  winwsExtraArgs: [],
  disableUpdateCheck: false,
  strategyEngine: "auto",
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
