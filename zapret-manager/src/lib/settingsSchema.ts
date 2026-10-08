import { z } from "zod";

import {
  DEFAULT_ADVANCED,
  DEFAULT_APPEARANCE,
  DEFAULT_GENERAL,
  DEFAULT_SETTINGS,
  DEFAULT_STRATEGY_UPDATES,
  DEFAULT_VPN,
} from "@/lib/defaults";
import { isValidRepo } from "@/lib/updateUtils";
import type { AppSettings } from "@/types";

export const MIN_TIMEOUT_SEC = 5;

export const MAX_TIMEOUT_SEC = 300;

export const MIN_LOG_RETENTION_DAYS = 1;

export const MAX_LOG_RETENTION_DAYS = 365;

export const MIN_HANDSHAKE_TIMEOUT_SEC = 5;

export const MAX_HANDSHAKE_TIMEOUT_SEC = 60;

const languageSchema = z.enum(["ru", "en"]);
const themeSchema = z.enum(["dark", "light", "auto"]);
const densitySchema = z.enum(["compact", "normal", "comfy"]);
const effectIntensitySchema = z.enum(["off", "subtle", "normal", "strong"]);
const qualitySchema = z.enum(["low", "medium", "high"]);
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

const outlastTrialsSchema = z.object({
  enabled: z.boolean().default(DEFAULT_SETTINGS.outlastTrials.enabled),
  domains: z.array(z.string()).default(DEFAULT_SETTINGS.outlastTrials.domains),
  ipRanges: z
    .array(z.string())
    .default(DEFAULT_SETTINGS.outlastTrials.ipRanges),
  ports: z
    .array(z.number().int().min(1).max(65535))
    .default(DEFAULT_SETTINGS.outlastTrials.ports),
  autoRestore: z.boolean().default(DEFAULT_SETTINGS.outlastTrials.autoRestore),
  createBackup: z
    .boolean()
    .default(DEFAULT_SETTINGS.outlastTrials.createBackup),
});

const generalSchema = z.object({
  language: languageSchema.default(DEFAULT_GENERAL.language),
  autoStart: z.boolean().default(DEFAULT_GENERAL.autoStart),
  minimizeToTray: z.boolean().default(DEFAULT_GENERAL.minimizeToTray),
  startMinimized: z.boolean().default(DEFAULT_GENERAL.startMinimized),
  showNotifications: z.boolean().default(DEFAULT_GENERAL.showNotifications),
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

const appearanceSchema = z.object({
  theme: themeSchema.default(DEFAULT_APPEARANCE.theme),
  density: densitySchema.default(DEFAULT_APPEARANCE.density),
  animations: z.boolean().default(DEFAULT_APPEARANCE.animations),
  reduceMotion: z.boolean().default(DEFAULT_APPEARANCE.reduceMotion),
  animateTrayIcon: z.boolean().default(DEFAULT_APPEARANCE.animateTrayIcon),
  postProcessing: postProcessingSchema,
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
      message: "Ожидается владелец/имя",
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
});

const appSettingsSchema = z.object({
  strategiesFolder: z.string().default(DEFAULT_SETTINGS.strategiesFolder),
  lastStrategyId: z.string().nullable().default(null),
  general: generalSchema.default(DEFAULT_GENERAL),
  appearance: appearanceSchema.default(DEFAULT_APPEARANCE),
  strategyUpdates: strategyUpdatesSchema.default(DEFAULT_STRATEGY_UPDATES),
  outlastTrials: outlastTrialsSchema.default(DEFAULT_SETTINGS.outlastTrials),
  vpn: vpnSchema.default(DEFAULT_VPN),
  advanced: advancedSchema.default(DEFAULT_ADVANCED),
});

export function validateSettings(data: unknown): AppSettings {
  const result = appSettingsSchema.safeParse(data);

  if (!result.success) {
    const first = result.error.issues[0];
    const path = first?.path.join(".") ?? "настройки";
    throw new Error(`${path}: ${first?.message ?? "неверное значение"}`);
  }

  return result.data;
}
