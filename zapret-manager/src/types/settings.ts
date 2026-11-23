// Импортируем зависимости из модуля ./games.
import type { GameSettings } from "./games";
// Импортируем зависимости из модуля ./log.
import type { LogLevel } from "./log";
// Импортируем зависимости из модуля ./vpn.
import type { VpnProvider } from "./vpn";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type ThemeMode = "dark" | "light" | "auto";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type DensityMode = "compact" | "normal" | "comfy";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type Language = "ru" | "en";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Канал, через который доходит уведомление.
/** Канал, через который доходит уведомление. */
// Обрабатываем конструкцию: export.
export type NotificationChannel = "app" | "windows";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type UpdateChannel = "stable" | "beta" | "nightly";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type ConfigKind = "domains" | "ips";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ConfigTarget {
  // Обрабатываем конструкцию: path.
  path: string;
  // Обрабатываем конструкцию: kind.
  kind: ConfigKind;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface InjectionReport {
  // Обрабатываем конструкцию: filesModified.
  filesModified: string[];
  // Обрабатываем конструкцию: domainsAdded.
  domainsAdded: number;
  // Обрабатываем конструкцию: ipsAdded.
  ipsAdded: number;
  // Обрабатываем конструкцию: portsAccepted.
  portsAccepted: number;
  // Обрабатываем конструкцию: backupsCreated.
  backupsCreated: string[];
  // Обрабатываем конструкцию: skippedDuplicates.
  skippedDuplicates: number;
  // Обрабатываем конструкцию: rejectedEntries.
  rejectedEntries: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface BackupInfo {
  // Обрабатываем конструкцию: originalPath.
  originalPath: string;
  // Обрабатываем конструкцию: backupPath.
  backupPath: string;
  // Обрабатываем конструкцию: createdAt.
  createdAt: number;
  // Обрабатываем конструкцию: size.
  size: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface VpnSettings {
  // Обрабатываем конструкцию: enabled.
  enabled: boolean;
  // Обрабатываем конструкцию: provider.
  provider: VpnProvider;
  // Обрабатываем конструкцию: configPath.
  configPath: string;
  // Обрабатываем конструкцию: autoConnect.
  autoConnect: boolean;
  // Обрабатываем конструкцию: killSwitch.
  killSwitch: boolean;
  // Обрабатываем конструкцию: activeConfigId.
  activeConfigId: string | null;
  // Обрабатываем конструкцию: autoConnectOnStart.
  autoConnectOnStart: boolean;
  // Обрабатываем конструкцию: handshakeTimeoutSec.
  handshakeTimeoutSec: number;
  // Обрабатываем конструкцию: lastConnectedAt.
  lastConnectedAt: number | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type StrategyEngine = "auto" | "native" | "legacy";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AdvancedSettings {
  // Обрабатываем конструкцию: loggingLevel.
  loggingLevel: LogLevel;
  // Обрабатываем конструкцию: logRetentionDays.
  logRetentionDays: number;
  // Обрабатываем конструкцию: strategyStartTimeoutSec.
  strategyStartTimeoutSec: number;
  // Обрабатываем конструкцию: strategyStopTimeoutSec.
  strategyStopTimeoutSec: number;
  // Обрабатываем конструкцию: winwsExtraArgs.
  winwsExtraArgs: string[];
  // Обрабатываем конструкцию: disableUpdateCheck.
  disableUpdateCheck: boolean;
  // Обрабатываем конструкцию: strategyEngine.
  strategyEngine: StrategyEngine;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GeneralSettings {
  // Обрабатываем конструкцию: language.
  language: Language;
  // Обрабатываем конструкцию: autoStart.
  autoStart: boolean;
  // Обрабатываем конструкцию: minimizeToTray.
  minimizeToTray: boolean;
  // Обрабатываем конструкцию: startMinimized.
  startMinimized: boolean;
  // Обрабатываем конструкцию: showNotifications.
  showNotifications: boolean;
  // Сохраняем пояснение разработчика: Где показывать уведомления: внутри приложения или системой W…
  /** Где показывать уведомления: внутри приложения или системой Windows. */
  // Обрабатываем конструкцию: notificationChannel.
  notificationChannel: NotificationChannel;
  // Обрабатываем конструкцию: enableLogs.
  enableLogs: boolean;
  // Обрабатываем конструкцию: showNotificationsOnStart.
  showNotificationsOnStart: boolean;
  // Обрабатываем конструкцию: showNotificationsOnStop.
  showNotificationsOnStop: boolean;
  // Обрабатываем конструкцию: showUpdateNotifications.
  showUpdateNotifications: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AppearanceSettings {
  // Обрабатываем конструкцию: theme.
  theme: ThemeMode;
  // Обрабатываем конструкцию: density.
  density: DensityMode;
  // Обрабатываем конструкцию: interfaceScale.
  interfaceScale: number;
  // Обрабатываем конструкцию: animationSpeed.
  animationSpeed: number;
  // Обрабатываем конструкцию: animations.
  animations: boolean;
  // Обрабатываем конструкцию: animateTrayIcon.
  animateTrayIcon: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface NetworkInfo {
  // Обрабатываем конструкцию: ip.
  ip: string;
  // Обрабатываем конструкцию: country.
  country: string;
  // Обрабатываем конструкцию: countryCode.
  countryCode: string;
  // Обрабатываем конструкцию: city.
  city: string;
  // Обрабатываем конструкцию: isp.
  isp: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface PingResult {
  // Обрабатываем конструкцию: host.
  host: string;
  // Обрабатываем конструкцию: latencyMs.
  latencyMs: number | null;
  // Обрабатываем конструкцию: success.
  success: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyUpdateSettings {
  // Обрабатываем конструкцию: autoCheck.
  autoCheck: boolean;
  // Обрабатываем конструкцию: checkIntervalHours.
  checkIntervalHours: number;
  // Обрабатываем конструкцию: autoDownload.
  autoDownload: boolean;
  // Обрабатываем конструкцию: githubRepo.
  githubRepo: string;
  // Обрабатываем конструкцию: ignoredVersions.
  ignoredVersions: string[];
  // Обрабатываем конструкцию: lastCheckAt.
  lastCheckAt: number | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AppSettings {
  // Обрабатываем конструкцию: strategiesFolder.
  strategiesFolder: string;
  // Обрабатываем конструкцию: lastStrategyId.
  lastStrategyId: string | null;
  // Обрабатываем конструкцию: general.
  general: GeneralSettings;
  // Обрабатываем конструкцию: appearance.
  appearance: AppearanceSettings;
  // Обрабатываем конструкцию: strategyUpdates.
  strategyUpdates: StrategyUpdateSettings;
  // Обрабатываем конструкцию: games.
  games: GameSettings[];
  // Обрабатываем конструкцию: vpn.
  vpn: VpnSettings;
  // Обрабатываем конструкцию: advanced.
  advanced: AdvancedSettings;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type SettingsSection =
  // Обрабатываем конструкцию: general.
  "general" | "vpn" | "appearance" | "strategies" | "updates" | "advanced";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type SaveState = "idle" | "saving" | "saved" | "error";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SystemInfo {
  // Обрабатываем конструкцию: os.
  os: string;
  // Обрабатываем конструкцию: osVersion.
  osVersion: string;
  // Обрабатываем конструкцию: osBuild.
  osBuild: string;
  // Обрабатываем конструкцию: arch.
  arch: string;
  // Обрабатываем конструкцию: tauriVersion.
  tauriVersion: string;
  // Обрабатываем конструкцию: rustVersion.
  rustVersion: string;
  // Обрабатываем конструкцию: appVersion.
  appVersion: string;
  // Обрабатываем конструкцию: webviewVersion.
  webviewVersion: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ConfigCheckReport {
  // Обрабатываем конструкцию: checked.
  checked: number;
  // Обрабатываем конструкцию: emptyFiles.
  emptyFiles: string[];
  // Обрабатываем конструкцию: duplicates.
  duplicates: string[];
  // Обрабатываем конструкцию: invalid.
  invalid: string[];
  // Обрабатываем конструкцию: strategiesVersion.
  strategiesVersion: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type FolderKind = "config" | "logs" | "strategies" | "backups";
// — разделитель логических блоков —
