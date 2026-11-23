// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля zod.
import { z } from "zod";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/defaults.
import {
  // Подключаем именованный импорт DEFAULT_ADVANCED.
  DEFAULT_ADVANCED,
  // Подключаем именованный импорт DEFAULT_APPEARANCE.
  DEFAULT_APPEARANCE,
  // Подключаем именованный импорт DEFAULT_GAMES.
  DEFAULT_GAMES,
  // Подключаем именованный импорт DEFAULT_GENERAL.
  DEFAULT_GENERAL,
  // Подключаем именованный импорт DEFAULT_SETTINGS.
  DEFAULT_SETTINGS,
  // Подключаем именованный импорт DEFAULT_STRATEGY_UPDATES.
  DEFAULT_STRATEGY_UPDATES,
  // Подключаем именованный импорт DEFAULT_VPN.
  DEFAULT_VPN,
  // Закрываем текущий блок.
} from "@/lib/defaults";
// Импортируем зависимости из модуля @/lib/settingsLimits.
import {
  // Подключаем именованный импорт MAX_GAME_PORTS.
  MAX_GAME_PORTS,
  // Подключаем именованный импорт MAX_GAMES.
  MAX_GAMES,
  // Подключаем именованный импорт MAX_INJECTED_ENTRIES.
  MAX_INJECTED_ENTRIES,
  // Закрываем текущий блок.
} from "@/lib/settingsLimits";
// Импортируем зависимости из модуля @/lib/appearanceTokens.
import {
  // Подключаем именованный импорт ANIMATION_SPEED_MAX.
  ANIMATION_SPEED_MAX,
  // Подключаем именованный импорт ANIMATION_SPEED_MIN.
  ANIMATION_SPEED_MIN,
  // Подключаем именованный импорт INTERFACE_SCALE_MAX.
  INTERFACE_SCALE_MAX,
  // Подключаем именованный импорт INTERFACE_SCALE_MIN.
  INTERFACE_SCALE_MIN,
  // Закрываем текущий блок.
} from "@/lib/appearanceTokens";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт UPDATE_MAX_INTERVAL_HOURS.
  UPDATE_MAX_INTERVAL_HOURS,
  // Подключаем именованный импорт UPDATE_MIN_INTERVAL_HOURS.
  UPDATE_MIN_INTERVAL_HOURS,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/defaultGames.
import { mergeBuiltinGames } from "@/lib/defaultGames";
// Импортируем зависимости из модуля @/lib/updateUtils.
import { isValidRepo } from "@/lib/updateUtils";
// Импортируем зависимости из модуля @/types.
import type { AppSettings, GameSettings } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MIN_TIMEOUT_SEC = 5;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MAX_TIMEOUT_SEC = 300;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MIN_LOG_RETENTION_DAYS = 1;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MAX_LOG_RETENTION_DAYS = 365;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MIN_HANDSHAKE_TIMEOUT_SEC = 5.
const MIN_HANDSHAKE_TIMEOUT_SEC = 5;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MAX_HANDSHAKE_TIMEOUT_SEC = 60;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const languageSchema = z.enum([ru, en]).
const languageSchema = z.enum(["ru", "en"]);
// Обрабатываем конструкцию: const themeSchema = z.enum([dark, light, auto]).
const themeSchema = z.enum(["dark", "light", "auto"]);
// Обрабатываем конструкцию: const densitySchema = z.enum([compact, normal, comfy]).
const densitySchema = z.enum(["compact", "normal", "comfy"]);
// Обрабатываем конструкцию: const logLevelSchema = z.enum([debug, info, success, wa….
const logLevelSchema = z.enum(["debug", "info", "success", "warn", "error"]);
// Обрабатываем конструкцию: const providerSchema = z.enum([wireguard, amnezia, open….
const providerSchema = z.enum(["wireguard", "amnezia", "openvpn"]);
// — разделитель логических блоков —

// Обрабатываем конструкцию: const gameSchema = z.object({ id: z.string().min(1).max….
const gameSchema = z.object({
  // Обрабатываем конструкцию: id.
  id: z.string().min(1).max(64),
  // Обрабатываем конструкцию: name.
  name: z.string().min(1).max(64),
  // Обрабатываем конструкцию: icon.
  icon: z.string().min(1).max(32),
  // Обрабатываем конструкцию: enabled.
  enabled: z.boolean(),
  // Обрабатываем конструкцию: builtin.
  builtin: z.boolean(),
  // Обрабатываем конструкцию: domains.
  domains: z.array(z.string().max(253)).max(MAX_INJECTED_ENTRIES),
  // Обрабатываем конструкцию: ipRanges.
  ipRanges: z.array(z.string().max(64)).max(MAX_INJECTED_ENTRIES),
  // Обрабатываем конструкцию: ports.
  ports: z.array(z.number().int().min(1).max(65535)).max(MAX_GAME_PORTS),
  // Обрабатываем конструкцию: autoRestore.
  autoRestore: z.boolean(),
  // Обрабатываем конструкцию: createBackup.
  createBackup: z.boolean(),
  // Обрабатываем конструкцию: createdAt.
  createdAt: z.number().int().min(0),
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: const generalSchema = z.object({ language: languageSche….
const generalSchema = z.object({
  // Обрабатываем конструкцию: language.
  language: languageSchema.default(DEFAULT_GENERAL.language),
  // Обрабатываем конструкцию: autoStart.
  autoStart: z.boolean().default(DEFAULT_GENERAL.autoStart),
  // Обрабатываем конструкцию: minimizeToTray.
  minimizeToTray: z.boolean().default(DEFAULT_GENERAL.minimizeToTray),
  // Обрабатываем конструкцию: startMinimized.
  startMinimized: z.boolean().default(DEFAULT_GENERAL.startMinimized),
  // Обрабатываем конструкцию: showNotifications.
  showNotifications: z.boolean().default(DEFAULT_GENERAL.showNotifications),
  // Обрабатываем конструкцию: notificationChannel.
  notificationChannel: z
    // Продолжаем цепочку вызовов.
    .enum(["app", "windows"])
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_GENERAL.notificationChannel),
  // Обрабатываем конструкцию: enableLogs.
  enableLogs: z.boolean().default(DEFAULT_GENERAL.enableLogs),
  // Обрабатываем конструкцию: showNotificationsOnStart.
  showNotificationsOnStart: z
    // Продолжаем цепочку вызовов.
    .boolean()
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_GENERAL.showNotificationsOnStart),
  // Обрабатываем конструкцию: showNotificationsOnStop.
  showNotificationsOnStop: z
    // Продолжаем цепочку вызовов.
    .boolean()
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_GENERAL.showNotificationsOnStop),
  // Обрабатываем конструкцию: showUpdateNotifications.
  showUpdateNotifications: z
    // Продолжаем цепочку вызовов.
    .boolean()
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_GENERAL.showUpdateNotifications),
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: const appearanceSchema = z.object({ theme: themeSchema.….
const appearanceSchema = z.object({
  // Обрабатываем конструкцию: theme.
  theme: themeSchema.default(DEFAULT_APPEARANCE.theme),
  // Обрабатываем конструкцию: density.
  density: densitySchema.default(DEFAULT_APPEARANCE.density),
  // Обрабатываем конструкцию: interfaceScale.
  interfaceScale: z
    // Продолжаем цепочку вызовов.
    .number()
    // Продолжаем цепочку вызовов.
    .min(INTERFACE_SCALE_MIN)
    // Продолжаем цепочку вызовов.
    .max(INTERFACE_SCALE_MAX)
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_APPEARANCE.interfaceScale),
  // Обрабатываем конструкцию: animationSpeed.
  animationSpeed: z
    // Продолжаем цепочку вызовов.
    .number()
    // Продолжаем цепочку вызовов.
    .min(ANIMATION_SPEED_MIN)
    // Продолжаем цепочку вызовов.
    .max(ANIMATION_SPEED_MAX)
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_APPEARANCE.animationSpeed),
  // Обрабатываем конструкцию: animations.
  animations: z.boolean().default(DEFAULT_APPEARANCE.animations),
  // Обрабатываем конструкцию: animateTrayIcon.
  animateTrayIcon: z.boolean().default(DEFAULT_APPEARANCE.animateTrayIcon),
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: const strategyUpdatesSchema = z.object({ autoCheck: z.b….
const strategyUpdatesSchema = z.object({
  // Обрабатываем конструкцию: autoCheck.
  autoCheck: z.boolean().default(DEFAULT_STRATEGY_UPDATES.autoCheck),
  // Обрабатываем конструкцию: checkIntervalHours.
  checkIntervalHours: z
    // Продолжаем цепочку вызовов.
    .number()
    // Продолжаем цепочку вызовов.
    .int()
    // Продолжаем цепочку вызовов.
    .min(UPDATE_MIN_INTERVAL_HOURS)
    // Продолжаем цепочку вызовов.
    .max(UPDATE_MAX_INTERVAL_HOURS)
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_STRATEGY_UPDATES.checkIntervalHours),
  // Обрабатываем конструкцию: autoDownload.
  autoDownload: z.boolean().default(DEFAULT_STRATEGY_UPDATES.autoDownload),
  // Обрабатываем конструкцию: githubRepo.
  githubRepo: z
    // Продолжаем цепочку вызовов.
    .string()
    // Продолжаем цепочку вызовов.
    .refine((value) => isValidRepo(value), {
      // Обрабатываем конструкцию: error.
      error: () => translateKey("validation.expectedRepo"),
      // Закрываем текущий блок.
    })
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_STRATEGY_UPDATES.githubRepo),
  // Обрабатываем конструкцию: ignoredVersions.
  ignoredVersions: z.array(z.string()).default([]),
  // Обрабатываем конструкцию: lastCheckAt.
  lastCheckAt: z.number().nullable().default(null),
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: const vpnSchema = z.object({ enabled: z.boolean().defau….
const vpnSchema = z.object({
  // Обрабатываем конструкцию: enabled.
  enabled: z.boolean().default(DEFAULT_VPN.enabled),
  // Обрабатываем конструкцию: provider.
  provider: providerSchema.default(DEFAULT_VPN.provider),
  // Обрабатываем конструкцию: configPath.
  configPath: z.string().default(DEFAULT_VPN.configPath),
  // Обрабатываем конструкцию: autoConnect.
  autoConnect: z.boolean().default(DEFAULT_VPN.autoConnect),
  // Обрабатываем конструкцию: killSwitch.
  killSwitch: z.boolean().default(DEFAULT_VPN.killSwitch),
  // Обрабатываем конструкцию: activeConfigId.
  activeConfigId: z.string().nullable().default(null),
  // Обрабатываем конструкцию: autoConnectOnStart.
  autoConnectOnStart: z.boolean().default(DEFAULT_VPN.autoConnectOnStart),
  // Обрабатываем конструкцию: handshakeTimeoutSec.
  handshakeTimeoutSec: z
    // Продолжаем цепочку вызовов.
    .number()
    // Продолжаем цепочку вызовов.
    .int()
    // Продолжаем цепочку вызовов.
    .min(MIN_HANDSHAKE_TIMEOUT_SEC)
    // Продолжаем цепочку вызовов.
    .max(MAX_HANDSHAKE_TIMEOUT_SEC)
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_VPN.handshakeTimeoutSec),
  // Обрабатываем конструкцию: lastConnectedAt.
  lastConnectedAt: z.number().nullable().default(null),
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: const advancedSchema = z.object({ loggingLevel: logLeve….
const advancedSchema = z.object({
  // Обрабатываем конструкцию: loggingLevel.
  loggingLevel: logLevelSchema.default(DEFAULT_ADVANCED.loggingLevel),
  // Обрабатываем конструкцию: logRetentionDays.
  logRetentionDays: z
    // Продолжаем цепочку вызовов.
    .number()
    // Продолжаем цепочку вызовов.
    .int()
    // Продолжаем цепочку вызовов.
    .min(MIN_LOG_RETENTION_DAYS)
    // Продолжаем цепочку вызовов.
    .max(MAX_LOG_RETENTION_DAYS)
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_ADVANCED.logRetentionDays),
  // Обрабатываем конструкцию: strategyStartTimeoutSec.
  strategyStartTimeoutSec: z
    // Продолжаем цепочку вызовов.
    .number()
    // Продолжаем цепочку вызовов.
    .int()
    // Продолжаем цепочку вызовов.
    .min(MIN_TIMEOUT_SEC)
    // Продолжаем цепочку вызовов.
    .max(MAX_TIMEOUT_SEC)
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_ADVANCED.strategyStartTimeoutSec),
  // Обрабатываем конструкцию: strategyStopTimeoutSec.
  strategyStopTimeoutSec: z
    // Продолжаем цепочку вызовов.
    .number()
    // Продолжаем цепочку вызовов.
    .int()
    // Продолжаем цепочку вызовов.
    .min(MIN_TIMEOUT_SEC)
    // Продолжаем цепочку вызовов.
    .max(MAX_TIMEOUT_SEC)
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_ADVANCED.strategyStopTimeoutSec),
  // Обрабатываем конструкцию: winwsExtraArgs.
  winwsExtraArgs: z.array(z.string()).default(DEFAULT_ADVANCED.winwsExtraArgs),
  // Обрабатываем конструкцию: disableUpdateCheck.
  disableUpdateCheck: z.boolean().default(DEFAULT_ADVANCED.disableUpdateCheck),
  // Сохраняем пояснение разработчика: // auto: движок выбирается по самой стратегии — нативный, ес…
  // auto: движок выбирается по самой стратегии — нативный, если конфиг
  // Сохраняем пояснение разработчика: // разбирается, иначе старый. Раньше режима не было, и выбор…
  // разбирается, иначе старый. Раньше режима не было, и выбор «нативный»
  // Сохраняем пояснение разработчика: // молча переключался на старый для стратегий без разбораемо…
  // молча переключался на старый для стратегий без разбораемого конфига.
  // Обрабатываем конструкцию: strategyEngine.
  strategyEngine: z
    // Продолжаем цепочку вызовов.
    .enum(["auto", "native", "legacy"])
    // Продолжаем цепочку вызовов.
    .default(DEFAULT_ADVANCED.strategyEngine),
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: const appSettingsSchema = z.object({ strategiesFolder: ….
const appSettingsSchema = z.object({
  // Обрабатываем конструкцию: strategiesFolder.
  strategiesFolder: z.string().default(DEFAULT_SETTINGS.strategiesFolder),
  // Обрабатываем конструкцию: lastStrategyId.
  lastStrategyId: z.string().nullable().default(null),
  // Обрабатываем конструкцию: general.
  general: generalSchema.default(DEFAULT_GENERAL),
  // Обрабатываем конструкцию: appearance.
  appearance: appearanceSchema.default(DEFAULT_APPEARANCE),
  // Обрабатываем конструкцию: strategyUpdates.
  strategyUpdates: strategyUpdatesSchema.default(DEFAULT_STRATEGY_UPDATES),
  // Обрабатываем конструкцию: games.
  games: z.array(gameSchema).max(MAX_GAMES).default(DEFAULT_GAMES),
  // Обрабатываем конструкцию: vpn.
  vpn: vpnSchema.default(DEFAULT_VPN),
  // Обрабатываем конструкцию: advanced.
  advanced: advancedSchema.default(DEFAULT_ADVANCED),
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LEGACY_OUTLAST_ID = outlast-trials.
const LEGACY_OUTLAST_ID = "outlast-trials";
// — разделитель логических блоков —

// Объявляем функцию migrateLegacyOutlast.
function migrateLegacyOutlast(
  // Обрабатываем конструкцию: value.
  value: Record<string, unknown>
  // Закрываем выражение или список аргументов.
): Record<string, unknown> {
  // Проверяем бизнес-условие: typeof value.games === object && value.games !== null.
  if (typeof value.games === "object" && value.games !== null) {
    // Возвращаем результат: value.
    return value;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const legacy = value.outlastTrials.
  const legacy = value.outlastTrials;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof legacy !== object || legacy === null.
  if (typeof legacy !== "object" || legacy === null) {
    // Возвращаем результат: value.
    return value;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const source = legacy as Record<string, unknown>.
  const source = legacy as Record<string, unknown>;
  // Обрабатываем конструкцию: const migrated: GameSettings = { id: LEGACY_OUTLAST_ID,….
  const migrated: GameSettings = {
    // Обрабатываем конструкцию: id.
    id: LEGACY_OUTLAST_ID,
    // Обрабатываем конструкцию: name.
    name: "Outlast Trials",
    // Обрабатываем конструкцию: icon.
    icon: "Gamepad2",
    // Обрабатываем конструкцию: enabled.
    enabled: source.enabled === true,
    // Обрабатываем конструкцию: builtin.
    builtin: true,
    // Обрабатываем конструкцию: domains.
    domains: Array.isArray(source.domains) ? (source.domains as string[]) : [],
    // Обрабатываем конструкцию: ipRanges.
    ipRanges: Array.isArray(source.ipRanges)
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        (source.ipRanges as string[])
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        [],
    // Обрабатываем конструкцию: ports.
    ports: Array.isArray(source.ports) ? (source.ports as number[]) : [],
    // Обрабатываем конструкцию: autoRestore.
    autoRestore: source.autoRestore !== false,
    // Обрабатываем конструкцию: createBackup.
    createBackup: source.createBackup !== false,
    // Обрабатываем конструкцию: createdAt.
    createdAt: 0,
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const rest = DEFAULT_GAMES.filter((item) => item.id !==….
  const rest = DEFAULT_GAMES.filter((item) => item.id !== LEGACY_OUTLAST_ID);
  // Обрабатываем конструкцию: const { outlastTrials: _legacy, ...withoutLegacy } = va….
  const { outlastTrials: _legacy, ...withoutLegacy } = value;
  // — разделитель логических блоков —

  // Возвращаем результат: { ...withoutLegacy, games: [migrated, ...rest] }.
  return { ...withoutLegacy, games: [migrated, ...rest] };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function validateSettings(data: unknown): AppSettings {
  // Обрабатываем конструкцию: const prepared = typeof data === object && data !== nul….
  const prepared =
    // Обрабатываем конструкцию: typeof data.
    typeof data === "object" && data !== null
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        migrateLegacyOutlast(data as Record<string, unknown>)
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        data;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const result = appSettingsSchema.safeParse(prepared).
  const result = appSettingsSchema.safeParse(prepared);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !result.success.
  if (!result.success) {
    // Обрабатываем конструкцию: const first = result.error.issues[0].
    const first = result.error.issues[0];
    // Обрабатываем конструкцию: const path = first?.path.join(.) ?? translateKey(settin….
    const path = first?.path.join(".") ?? translateKey("settingsFile.root");
    // Выбрасываем исключение throw new Error( ${path}: ${first?.message ?? tran….
    throw new Error(
      // Обрабатываем конструкцию: ${.
      `${path}: ${first?.message ?? translateKey("settingsFile.invalidValue")}`
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Склейка с пресетами встроенных игр — именно здесь, а не в…
  // Склейка с пресетами встроенных игр — именно здесь, а не в запасной ветке
  // Сохраняем пояснение разработчика: // разбора. Иначе сохранённый settings.json переживает обнов…
  // разбора. Иначе сохранённый settings.json переживает обновление приложения
  // Сохраняем пояснение разработчика: // и новые домены/порты игр до него не доезжают (см. mergeBu…
  // и новые домены/порты игр до него не доезжают (см. mergeBuiltinGame).
  // Возвращаем результат: { ...result.data, games: mergeBuiltinGames(result.data.….
  return { ...result.data, games: mergeBuiltinGames(result.data.games) };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
