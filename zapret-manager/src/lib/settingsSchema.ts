import { translateKey } from "@/i18n/core";
import { z } from "zod";

import {
  DEFAULT_ADVANCED,
  DEFAULT_APPEARANCE,
  DEFAULT_GAMES,
  DEFAULT_GENERAL,
  DEFAULT_SETTINGS,
  DEFAULT_STRATEGY_UPDATES,
  DEFAULT_VPN,
} from "@/lib/defaults";
import {
  MAX_GAME_PORTS,
  MAX_GAMES,
  MAX_INJECTED_ENTRIES,
} from "@/lib/settingsLimits";
import {
  ANIMATION_SPEED_MAX,
  ANIMATION_SPEED_MIN,
  INTERFACE_SCALE_MAX,
  INTERFACE_SCALE_MIN,
} from "@/lib/appearanceTokens";
import { mergeBuiltinGames } from "@/lib/defaultGames";
import { isValidRepo } from "@/lib/updateUtils";
import type { AppSettings, GameSettings } from "@/types";

export const MIN_TIMEOUT_SEC = 5;

export const MAX_TIMEOUT_SEC = 300;

export const MIN_LOG_RETENTION_DAYS = 1;

export const MAX_LOG_RETENTION_DAYS = 365;

const MIN_HANDSHAKE_TIMEOUT_SEC = 5;

export const MAX_HANDSHAKE_TIMEOUT_SEC = 60;

const languageSchema = z.enum(["ru", "en"]);
const themeSchema = z.enum(["dark", "light", "auto"]);
const densitySchema = z.enum(["compact", "normal", "comfy"]);
const effectIntensitySchema = z.enum(["off", "subtle", "normal", "strong"]);
const qualitySchema = z.enum(["low", "medium", "high"]);
const flameIntensitySchema = z.enum(["subtle", "normal", "strong"]);
const flameSpeedSchema = z.enum(["slow", "normal", "fast"]);
const logLevelSchema = z.enum(["debug", "info", "success", "warn", "error"]);
const providerSchema = z.enum(["wireguard", "amnezia", "openvpn"]);

const postProcessingSchema = z.object({
  bloom: effectIntensitySchema.default(DEFAULT_APPEARANCE.postProcessing.bloom),
  vignette: effectIntensitySchema.default(
    DEFAULT_APPEARANCE.postProcessing.vignette
  ),
  filmGrain: z.boolean().default(DEFAULT_APPEARANCE.postProcessing.filmGrain),
  scanlines: z.boolean().default(DEFAULT_APPEARANCE.postProcessing.scanlines),
  chromaticAberration: z
    .boolean()
    .default(DEFAULT_APPEARANCE.postProcessing.chromaticAberration),
  motionBlur: z.boolean().default(DEFAULT_APPEARANCE.postProcessing.motionBlur),
  globalQuality: qualitySchema.default(
    DEFAULT_APPEARANCE.postProcessing.globalQuality
  ),
});

const gameSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(64),
  icon: z.string().min(1).max(32),
  enabled: z.boolean(),
  builtin: z.boolean(),
  domains: z.array(z.string().max(253)).max(MAX_INJECTED_ENTRIES),
  ipRanges: z.array(z.string().max(64)).max(MAX_INJECTED_ENTRIES),
  ports: z.array(z.number().int().min(1).max(65535)).max(MAX_GAME_PORTS),
  autoRestore: z.boolean(),
  createBackup: z.boolean(),
  createdAt: z.number().int().min(0),
});

const generalSchema = z.object({
  language: languageSchema.default(DEFAULT_GENERAL.language),
  autoStart: z.boolean().default(DEFAULT_GENERAL.autoStart),
  minimizeToTray: z.boolean().default(DEFAULT_GENERAL.minimizeToTray),
  startMinimized: z.boolean().default(DEFAULT_GENERAL.startMinimized),
  showNotifications: z.boolean().default(DEFAULT_GENERAL.showNotifications),
  enableLogs: z.boolean().default(DEFAULT_GENERAL.enableLogs),
  showNotificationsOnStart: z
    .boolean()
    .default(DEFAULT_GENERAL.showNotificationsOnStart),
  showNotificationsOnStop: z
    .boolean()
    .default(DEFAULT_GENERAL.showNotificationsOnStop),
  showUpdateNotifications: z
    .boolean()
    .default(DEFAULT_GENERAL.showUpdateNotifications),
});

const flameSchema = z.object({
  enabled: z.boolean().default(DEFAULT_APPEARANCE.flame.enabled),
  intensity: flameIntensitySchema.default(DEFAULT_APPEARANCE.flame.intensity),
  speed: flameSpeedSchema.default(DEFAULT_APPEARANCE.flame.speed),
  chromatic: z.boolean().default(DEFAULT_APPEARANCE.flame.chromatic),
  forceOn: z.boolean().default(DEFAULT_APPEARANCE.flame.forceOn),
});

const appearanceSchema = z.object({
  theme: themeSchema.default(DEFAULT_APPEARANCE.theme),
  density: densitySchema.default(DEFAULT_APPEARANCE.density),
  interfaceScale: z
    .number()
    .min(INTERFACE_SCALE_MIN)
    .max(INTERFACE_SCALE_MAX)
    .default(DEFAULT_APPEARANCE.interfaceScale),
  animationSpeed: z
    .number()
    .min(ANIMATION_SPEED_MIN)
    .max(ANIMATION_SPEED_MAX)
    .default(DEFAULT_APPEARANCE.animationSpeed),
  animations: z.boolean().default(DEFAULT_APPEARANCE.animations),
  animateTrayIcon: z.boolean().default(DEFAULT_APPEARANCE.animateTrayIcon),
  postProcessing: postProcessingSchema,
  flame: flameSchema,
});

const strategyUpdatesSchema = z.object({
  autoCheck: z.boolean().default(DEFAULT_STRATEGY_UPDATES.autoCheck),
  checkIntervalHours: z
    .number()
    .int()
    .min(1)
    .max(168)
    .default(DEFAULT_STRATEGY_UPDATES.checkIntervalHours),
  autoDownload: z.boolean().default(DEFAULT_STRATEGY_UPDATES.autoDownload),
  githubRepo: z
    .string()
    .refine((value) => isValidRepo(value), {
      error: () => translateKey("validation.expectedRepo"),
    })
    .default(DEFAULT_STRATEGY_UPDATES.githubRepo),
  ignoredVersions: z.array(z.string()).default([]),
  lastCheckAt: z.number().nullable().default(null),
});

const vpnSchema = z.object({
  enabled: z.boolean().default(DEFAULT_VPN.enabled),
  provider: providerSchema.default(DEFAULT_VPN.provider),
  configPath: z.string().default(DEFAULT_VPN.configPath),
  autoConnect: z.boolean().default(DEFAULT_VPN.autoConnect),
  killSwitch: z.boolean().default(DEFAULT_VPN.killSwitch),
  activeConfigId: z.string().nullable().default(null),
  autoConnectOnStart: z.boolean().default(DEFAULT_VPN.autoConnectOnStart),
  handshakeTimeoutSec: z
    .number()
    .int()
    .min(MIN_HANDSHAKE_TIMEOUT_SEC)
    .max(MAX_HANDSHAKE_TIMEOUT_SEC)
    .default(DEFAULT_VPN.handshakeTimeoutSec),
  lastConnectedAt: z.number().nullable().default(null),
});

const advancedSchema = z.object({
  loggingLevel: logLevelSchema.default(DEFAULT_ADVANCED.loggingLevel),
  logRetentionDays: z
    .number()
    .int()
    .min(MIN_LOG_RETENTION_DAYS)
    .max(MAX_LOG_RETENTION_DAYS)
    .default(DEFAULT_ADVANCED.logRetentionDays),
  strategyStartTimeoutSec: z
    .number()
    .int()
    .min(MIN_TIMEOUT_SEC)
    .max(MAX_TIMEOUT_SEC)
    .default(DEFAULT_ADVANCED.strategyStartTimeoutSec),
  strategyStopTimeoutSec: z
    .number()
    .int()
    .min(MIN_TIMEOUT_SEC)
    .max(MAX_TIMEOUT_SEC)
    .default(DEFAULT_ADVANCED.strategyStopTimeoutSec),
  winwsExtraArgs: z.array(z.string()).default(DEFAULT_ADVANCED.winwsExtraArgs),
  disableUpdateCheck: z.boolean().default(DEFAULT_ADVANCED.disableUpdateCheck),
  // auto: движок выбирается по самой стратегии — нативный, если конфиг
  // разбирается, иначе старый. Раньше режима не было, и выбор «нативный»
  // молча переключался на старый для стратегий без разбораемого конфига.
  strategyEngine: z
    .enum(["auto", "native", "legacy"])
    .default(DEFAULT_ADVANCED.strategyEngine),
});

const appSettingsSchema = z.object({
  strategiesFolder: z.string().default(DEFAULT_SETTINGS.strategiesFolder),
  lastStrategyId: z.string().nullable().default(null),
  general: generalSchema.default(DEFAULT_GENERAL),
  appearance: appearanceSchema.default(DEFAULT_APPEARANCE),
  strategyUpdates: strategyUpdatesSchema.default(DEFAULT_STRATEGY_UPDATES),
  games: z.array(gameSchema).max(MAX_GAMES).default(DEFAULT_GAMES),
  vpn: vpnSchema.default(DEFAULT_VPN),
  advanced: advancedSchema.default(DEFAULT_ADVANCED),
});

const LEGACY_OUTLAST_ID = "outlast-trials";

function migrateLegacyOutlast(
  value: Record<string, unknown>
): Record<string, unknown> {
  if (typeof value.games === "object" && value.games !== null) {
    return value;
  }

  const legacy = value.outlastTrials;

  if (typeof legacy !== "object" || legacy === null) {
    return value;
  }

  const source = legacy as Record<string, unknown>;
  const migrated: GameSettings = {
    id: LEGACY_OUTLAST_ID,
    name: "Outlast Trials",
    icon: "Gamepad2",
    enabled: source.enabled === true,
    builtin: true,
    domains: Array.isArray(source.domains) ? (source.domains as string[]) : [],
    ipRanges: Array.isArray(source.ipRanges)
      ? (source.ipRanges as string[])
      : [],
    ports: Array.isArray(source.ports) ? (source.ports as number[]) : [],
    autoRestore: source.autoRestore !== false,
    createBackup: source.createBackup !== false,
    createdAt: 0,
  };

  const rest = DEFAULT_GAMES.filter((item) => item.id !== LEGACY_OUTLAST_ID);
  const { outlastTrials: _legacy, ...withoutLegacy } = value;

  return { ...withoutLegacy, games: [migrated, ...rest] };
}

export function validateSettings(data: unknown): AppSettings {
  const prepared =
    typeof data === "object" && data !== null
      ? migrateLegacyOutlast(data as Record<string, unknown>)
      : data;

  const result = appSettingsSchema.safeParse(prepared);

  if (!result.success) {
    const first = result.error.issues[0];
    const path = first?.path.join(".") ?? translateKey("settingsFile.root");
    throw new Error(
      `${path}: ${first?.message ?? translateKey("settingsFile.invalidValue")}`
    );
  }

  // Склейка с пресетами встроенных игр — именно здесь, а не в запасной ветке
  // разбора. Иначе сохранённый settings.json переживает обновление приложения
  // и новые домены/порты игр до него не доезжают (см. mergeBuiltinGame).
  return { ...result.data, games: mergeBuiltinGames(result.data.games) };
}
