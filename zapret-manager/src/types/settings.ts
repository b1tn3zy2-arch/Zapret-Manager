import type { PostProcessingSettings } from "./appearance";
import type { GameSettings } from "./games";
import type { LogLevel } from "./log";
import type { VpnProvider } from "./vpn";

export type ThemeMode = "dark" | "light" | "auto";

export type DensityMode = "compact" | "normal" | "comfy";

export type Language = "ru" | "en";

export type UpdateChannel = "stable" | "beta" | "nightly";

export type ConfigKind = "domains" | "ips";

export interface ConfigTarget {
  path: string;
  kind: ConfigKind;
}

export interface InjectionReport {
  filesModified: string[];
  domainsAdded: number;
  ipsAdded: number;
  portsAccepted: number;
  backupsCreated: string[];
  skippedDuplicates: number;
  rejectedEntries: number;
}

export interface BackupInfo {
  originalPath: string;
  backupPath: string;
  createdAt: number;
  size: number;
}

export interface VpnSettings {
  enabled: boolean;
  provider: VpnProvider;
  configPath: string;
  autoConnect: boolean;
  killSwitch: boolean;
  activeConfigId: string | null;
  autoConnectOnStart: boolean;
  handshakeTimeoutSec: number;
  lastConnectedAt: number | null;
}

export type StrategyEngine = "native" | "legacy";

export interface AdvancedSettings {
  loggingLevel: LogLevel;
  logRetentionDays: number;
  strategyStartTimeoutSec: number;
  strategyStopTimeoutSec: number;
  winwsExtraArgs: string[];
  disableUpdateCheck: boolean;
  strategyEngine: StrategyEngine;
}

export interface GeneralSettings {
  language: Language;
  autoStart: boolean;
  minimizeToTray: boolean;
  startMinimized: boolean;
  showNotifications: boolean;
  enableLogs: boolean;
  showNotificationsOnStart: boolean;
  showNotificationsOnStop: boolean;
  showUpdateNotifications: boolean;
}

export interface AppearanceSettings {
  theme: ThemeMode;
  density: DensityMode;
  interfaceScale: number;
  animationSpeed: number;
  animations: boolean;
  animateTrayIcon: boolean;
  postProcessing: PostProcessingSettings;
}

export interface NetworkInfo {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
}

export interface PingResult {
  host: string;
  latencyMs: number | null;
  success: boolean;
}

export interface StrategyUpdateSettings {
  autoCheck: boolean;
  checkIntervalHours: number;
  autoDownload: boolean;
  githubRepo: string;
  ignoredVersions: string[];
  lastCheckAt: number | null;
}

export interface AppSettings {
  strategiesFolder: string;
  lastStrategyId: string | null;
  general: GeneralSettings;
  appearance: AppearanceSettings;
  strategyUpdates: StrategyUpdateSettings;
  games: GameSettings[];
  vpn: VpnSettings;
  advanced: AdvancedSettings;
}

export type SettingsSection =
  "general" | "appearance" | "strategies" | "updates" | "advanced";

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface SystemInfo {
  os: string;
  osVersion: string;
  osBuild: string;
  arch: string;
  tauriVersion: string;
  rustVersion: string;
  appVersion: string;
  webviewVersion: string;
}

export interface ConfigCheckReport {
  checked: number;
  emptyFiles: string[];
  duplicates: string[];
  invalid: string[];
  strategiesVersion: string;
}

export type FolderKind = "config" | "logs" | "strategies" | "backups";
