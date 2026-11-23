// Импортируем зависимости из модуля @/lib/constants.
import { DEFAULT_GITHUB_REPO } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/defaultGames.
import { getDefaultGames } from "@/lib/defaultGames";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SETTINGS_FILE_NAME = "settings.json";
// Обрабатываем конструкцию: export.
export const SETTINGS_SYNC_DEBOUNCE_MS = 400;
// Импортируем зависимости из модуля @/types.
import type {
  // Подключаем именованный импорт AdvancedSettings.
  AdvancedSettings,
  // Подключаем именованный импорт AppearanceSettings.
  AppearanceSettings,
  // Подключаем именованный импорт AppSettings.
  AppSettings,
  // Подключаем именованный импорт GameSettings.
  GameSettings,
  // Подключаем именованный импорт GeneralSettings.
  GeneralSettings,
  // Подключаем именованный импорт StrategyUpdateSettings.
  StrategyUpdateSettings,
  // Подключаем именованный импорт VpnSettings.
  VpnSettings,
  // Закрываем текущий блок.
} from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DEFAULT_GAMES: GameSettings[] = getDefaultGames();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DEFAULT_VPN: VpnSettings = {
  // Сохраняем пояснение разработчика: // Раздел VPN на главной странице работает на ядре Xray и не…
  // Раздел VPN на главной странице работает на ядре Xray и не зависит от
  // Сохраняем пояснение разработчика: // старого WireGuard-стека. По умолчанию он должен быть вклю…
  // старого WireGuard-стека. По умолчанию он должен быть включён, иначе
  // Сохраняем пояснение разработчика: // кнопка подключения была бы заблокирована сразу после уста…
  // кнопка подключения была бы заблокирована сразу после установки.
  // Обрабатываем конструкцию: enabled.
  enabled: true,
  // Обрабатываем конструкцию: provider.
  provider: "wireguard",
  // Обрабатываем конструкцию: configPath.
  configPath: "",
  // Обрабатываем конструкцию: autoConnect.
  autoConnect: false,
  // Обрабатываем конструкцию: killSwitch.
  killSwitch: false,
  // Обрабатываем конструкцию: activeConfigId.
  activeConfigId: null,
  // Обрабатываем конструкцию: autoConnectOnStart.
  autoConnectOnStart: false,
  // Обрабатываем конструкцию: handshakeTimeoutSec.
  handshakeTimeoutSec: 15,
  // Обрабатываем конструкцию: lastConnectedAt.
  lastConnectedAt: null,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DEFAULT_GENERAL: GeneralSettings = {
  // Обрабатываем конструкцию: language.
  language: "ru",
  // Обрабатываем конструкцию: autoStart.
  autoStart: false,
  // Обрабатываем конструкцию: minimizeToTray.
  minimizeToTray: true,
  // Обрабатываем конструкцию: startMinimized.
  startMinimized: false,
  // Обрабатываем конструкцию: showNotifications.
  showNotifications: true,
  // Обрабатываем конструкцию: notificationChannel.
  notificationChannel: "app",
  // Обрабатываем конструкцию: enableLogs.
  enableLogs: true,
  // Обрабатываем конструкцию: showNotificationsOnStart.
  showNotificationsOnStart: false,
  // Обрабатываем конструкцию: showNotificationsOnStop.
  showNotificationsOnStop: false,
  // Обрабатываем конструкцию: showUpdateNotifications.
  showUpdateNotifications: true,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DEFAULT_APPEARANCE: AppearanceSettings = {
  // Обрабатываем конструкцию: theme.
  theme: "dark",
  // Обрабатываем конструкцию: density.
  density: "normal",
  // Обрабатываем конструкцию: interfaceScale.
  interfaceScale: 100,
  // Обрабатываем конструкцию: animationSpeed.
  animationSpeed: 100,
  // Обрабатываем конструкцию: animations.
  animations: true,
  // Обрабатываем конструкцию: animateTrayIcon.
  animateTrayIcon: true,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DEFAULT_ADVANCED: AdvancedSettings = {
  // Обрабатываем конструкцию: loggingLevel.
  loggingLevel: "info",
  // Обрабатываем конструкцию: logRetentionDays.
  logRetentionDays: 7,
  // Обрабатываем конструкцию: strategyStartTimeoutSec.
  strategyStartTimeoutSec: 15,
  // Обрабатываем конструкцию: strategyStopTimeoutSec.
  strategyStopTimeoutSec: 10,
  // Обрабатываем конструкцию: winwsExtraArgs.
  winwsExtraArgs: [],
  // Обрабатываем конструкцию: disableUpdateCheck.
  disableUpdateCheck: false,
  // Обрабатываем конструкцию: strategyEngine.
  strategyEngine: "auto",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DEFAULT_LOG_BUFFER_SIZE = 10_000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DEFAULT_STRATEGY_UPDATES: StrategyUpdateSettings = {
  // Обрабатываем конструкцию: autoCheck.
  autoCheck: true,
  // Обрабатываем конструкцию: checkIntervalHours.
  checkIntervalHours: 24,
  // Обрабатываем конструкцию: autoDownload.
  autoDownload: false,
  // Обрабатываем конструкцию: githubRepo.
  githubRepo: DEFAULT_GITHUB_REPO,
  // Обрабатываем конструкцию: ignoredVersions.
  ignoredVersions: [],
  // Обрабатываем конструкцию: lastCheckAt.
  lastCheckAt: null,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DEFAULT_SETTINGS: AppSettings = {
  // Обрабатываем конструкцию: strategiesFolder.
  strategiesFolder: "",
  // Обрабатываем конструкцию: lastStrategyId.
  lastStrategyId: null,
  // Обрабатываем конструкцию: general.
  general: DEFAULT_GENERAL,
  // Обрабатываем конструкцию: appearance.
  appearance: DEFAULT_APPEARANCE,
  // Обрабатываем конструкцию: strategyUpdates.
  strategyUpdates: DEFAULT_STRATEGY_UPDATES,
  // Обрабатываем конструкцию: games.
  games: DEFAULT_GAMES,
  // Обрабатываем конструкцию: vpn.
  vpn: DEFAULT_VPN,
  // Обрабатываем конструкцию: advanced.
  advanced: DEFAULT_ADVANCED,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —
