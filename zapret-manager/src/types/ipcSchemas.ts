// Импортируем зависимости из модуля zod.
import { z } from "zod";
// Импортируем зависимости из модуля ./installed-game.
import {
  // Подключаем именованный импорт INSTALLED_GAME_ANTICHEATS.
  INSTALLED_GAME_ANTICHEATS,
  // Подключаем именованный импорт INSTALLED_GAME_PLATFORMS.
  INSTALLED_GAME_PLATFORMS,
  // Подключаем именованный импорт INSTALLED_GAME_SOURCES.
  INSTALLED_GAME_SOURCES,
  // Закрываем текущий блок.
} from "./installed-game";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./strategy.
import {
  // Подключаем именованный импорт SERVICE_TYPES.
  SERVICE_TYPES,
  // Подключаем именованный импорт STRATEGY_FILE_TYPES.
  STRATEGY_FILE_TYPES,
  // Подключаем именованный импорт STRATEGY_STATUSES.
  STRATEGY_STATUSES,
  // Подключаем именованный импорт TECHNIQUE_IDS.
  TECHNIQUE_IDS,
  // Закрываем текущий блок.
} from "./strategy";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const UpdateInfoSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: available.
    available: z.boolean(),
    // Обрабатываем конструкцию: currentVersion.
    currentVersion: z.string().max(32),
    // Обрабатываем конструкцию: latestVersion.
    latestVersion: z.string().max(32),
    // Обрабатываем конструкцию: releaseName.
    releaseName: z.string().max(200),
    // Обрабатываем конструкцию: releaseNotes.
    releaseNotes: z.string().max(20_000),
    // Обрабатываем конструкцию: publishedAt.
    publishedAt: z.string().max(64),
    // Обрабатываем конструкцию: downloadUrl.
    downloadUrl: z.string().max(512),
    // Обрабатываем конструкцию: assetName.
    assetName: z.string().max(255),
    // Обрабатываем конструкцию: digest.
    digest: z.string().max(128),
    // Обрабатываем конструкцию: size.
    size: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: isNewer.
    isNewer: z.boolean(),
    // Обрабатываем конструкцию: ignored.
    ignored: z.boolean(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const InitReportSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: firstRun.
    firstRun: z.boolean(),
    // Обрабатываем конструкцию: updated.
    updated: z.boolean(),
    // Обрабатываем конструкцию: strategiesCount.
    strategiesCount: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: resourcesVersion.
    resourcesVersion: z.string().max(32),
    // Обрабатываем конструкцию: extractedBytes.
    extractedBytes: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: available.
    available: z.boolean(),
    // Обрабатываем конструкцию: vpnCoreIncluded.
    vpnCoreIncluded: z.boolean(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const IntegrityReportSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: total.
    total: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: missing.
    missing: z.array(z.string().max(512)).max(1_000),
    // Обрабатываем конструкцию: modified.
    modified: z.array(z.string().max(512)).max(1_000),
    // Обрабатываем конструкцию: ok.
    ok: z.boolean(),
    // Обрабатываем конструкцию: resourcesVersion.
    resourcesVersion: z.string().max(32),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const RestoreReportSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: restored.
    restored: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: skipped.
    skipped: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: resourcesVersion.
    resourcesVersion: z.string().max(32),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const VpnStatsSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: interface.
    interface: z.string().max(64).nullable(),
    // Обрабатываем конструкцию: endpoint.
    endpoint: z.string().max(200).nullable(),
    // Обрабатываем конструкцию: handshakeAt.
    handshakeAt: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: bytesIn.
    bytesIn: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: bytesOut.
    bytesOut: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: uptimeSec.
    uptimeSec: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: isSwitching.
    isSwitching: z.boolean(),
    // Обрабатываем конструкцию: killSwitchOn.
    killSwitchOn: z.boolean(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const XrayStatusSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: installed.
    installed: z.boolean(),
    // Обрабатываем конструкцию: running.
    running: z.boolean(),
    // Обрабатываем конструкцию: activeServerId.
    activeServerId: z.string().max(64).nullable(),
    // Обрабатываем конструкцию: uptimeSec.
    uptimeSec: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: socksPort.
    socksPort: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: httpPort.
    httpPort: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: pid.
    pid: z.number().int().nonnegative().nullable(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const RunningInfoSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: strategyId.
    strategyId: z.string().max(64),
    // Обрабатываем конструкцию: pid.
    pid: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: logPath.
    logPath: z.string().max(600),
    // Обрабатываем конструкцию: startedAt.
    startedAt: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: alive.
    alive: z.boolean(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const InstalledGameSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: id.
    id: z.string().max(200),
    // Обрабатываем конструкцию: name.
    name: z.string().max(200),
    // Обрабатываем конструкцию: appid.
    appid: z.string().max(64).nullable(),
    // Обрабатываем конструкцию: platform.
    platform: z.enum(INSTALLED_GAME_PLATFORMS),
    // Обрабатываем конструкцию: source.
    source: z.enum(INSTALLED_GAME_SOURCES),
    // Обрабатываем конструкцию: installPath.
    installPath: z.string().max(600),
    // Обрабатываем конструкцию: executablePath.
    executablePath: z.string().max(600),
    // Обрабатываем конструкцию: launchArgs.
    launchArgs: z.string().max(2_000).nullable(),
    // Обрабатываем конструкцию: coverUrl.
    coverUrl: z.string().max(600).nullable(),
    // Обрабатываем конструкцию: coverPath.
    coverPath: z.string().max(600).nullable(),
    // Обрабатываем конструкцию: gameSettingsId.
    gameSettingsId: z.string().max(64).nullable(),
    // Обрабатываем конструкцию: anticheat.
    anticheat: z.enum(INSTALLED_GAME_ANTICHEATS).nullable(),
    // Обрабатываем конструкцию: lastLaunchedAt.
    lastLaunchedAt: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: launchCount.
    launchCount: z.number().int().nonnegative(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const NetworkStatsSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: bytesIn.
    bytesIn: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: bytesOut.
    bytesOut: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: speedIn.
    speedIn: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: speedOut.
    speedOut: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: packetsIn.
    packetsIn: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: packetsOut.
    packetsOut: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: connections.
    connections: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: timestamp.
    timestamp: z.number().int().nonnegative(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const NetworkInfoSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: ip.
    ip: z.string().max(64),
    // Обрабатываем конструкцию: country.
    country: z.string().max(120),
    // Обрабатываем конструкцию: countryCode.
    countryCode: z.string().max(8),
    // Обрабатываем конструкцию: city.
    city: z.string().max(120),
    // Обрабатываем конструкцию: isp.
    isp: z.string().max(160),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const KnownGameMatchSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: appid.
    appid: z.string().max(64),
    // Обрабатываем конструкцию: name.
    name: z.string().max(200),
    // Обрабатываем конструкцию: cover.
    cover: z.string().max(200).nullable(),
    // Обрабатываем конструкцию: domainSettingsId.
    domainSettingsId: z.string().max(64).nullable(),
    // Обрабатываем конструкцию: anticheat.
    anticheat: z.string().max(64),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SubscriptionInfoSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: trafficUsedGb.
    trafficUsedGb: z.number().nonnegative().nullable(),
    // Обрабатываем конструкцию: trafficLimitGb.
    trafficLimitGb: z.number().nonnegative().nullable(),
    // Обрабатываем конструкцию: trafficPercent.
    trafficPercent: z.number().min(0).max(100).nullable(),
    // Обрабатываем конструкцию: daysRemaining.
    daysRemaining: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: isActive.
    isActive: z.boolean(),
    // Обрабатываем конструкцию: isLinked.
    isLinked: z.boolean(),
    // Обрабатываем конструкцию: title.
    title: z.string().max(160).nullable(),
    // Обрабатываем конструкцию: serverCount.
    serverCount: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: expiresAt.
    expiresAt: z.number().int().nullable(),
    // Обрабатываем конструкцию: lastCheckedAt.
    lastCheckedAt: z.number().int().nonnegative().nullable(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const StrategyRatingRecordSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: strategyId.
    strategyId: z.string().max(96),
    // Обрабатываем конструкцию: strategyHash.
    strategyHash: z.string().max(128),
    // Обрабатываем конструкцию: networkKey.
    networkKey: z.string().max(128),
    // Обрабатываем конструкцию: providerLabel.
    providerLabel: z.string().max(160).nullable(),
    // Обрабатываем конструкцию: machineKey.
    machineKey: z.string().max(128),
    // Обрабатываем конструкцию: samples.
    samples: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: ratingScore.
    ratingScore: z.number().min(0).max(100).nullable(),
    // Обрабатываем конструкцию: coverage.
    coverage: z.number().min(0).max(1).nullable(),
    // Обрабатываем конструкцию: successRate.
    successRate: z.number().min(0).max(1).nullable(),
    // Обрабатываем конструкцию: medianLatencyMs.
    medianLatencyMs: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: jitterMs.
    jitterMs: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: lastMeasuredAt.
    lastMeasuredAt: z.number().int().nonnegative(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const StrategyRatingRecordArraySchema = z
  // Продолжаем цепочку вызовов.
  .array(StrategyRatingRecordSchema)
  // Продолжаем цепочку вызовов.
  .max(1000);
// — разделитель логических блоков —

// Обрабатываем конструкцию: const TariffPlanSchema = z .object({ id: z.string().max….
const TariffPlanSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: id.
    id: z.string().max(32),
    // Обрабатываем конструкцию: months.
    months: z.number().int().positive(),
    // Обрабатываем конструкцию: days.
    days: z.number().int().positive(),
    // Обрабатываем конструкцию: basePrice.
    basePrice: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: highlight.
    highlight: z.enum(["none", "popular", "profitable", "best"]),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: const TariffPriceSchema = z .object({ planId: z.string(….
const TariffPriceSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: planId.
    planId: z.string().max(32),
    // Обрабатываем конструкцию: devices.
    devices: z.number().int().positive(),
    // Обрабатываем конструкцию: total.
    total: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: perMonth.
    perMonth: z.number().int().nonnegative(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const CreatedOrderSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: url.
    url: z.string().url().max(600),
    // Обрабатываем конструкцию: guid.
    guid: z.string().max(64),
    // Обрабатываем конструкцию: amount.
    amount: z.number().int().nonnegative().nullable(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const TariffMatrixSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: plans.
    plans: z.array(TariffPlanSchema).max(16),
    // Обрабатываем конструкцию: prices.
    prices: z.array(TariffPriceSchema).max(256),
    // Обрабатываем конструкцию: deviceCounts.
    deviceCounts: z.array(z.number().int().positive()).max(16),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const AutoConnectReportSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: serverId.
    serverId: z.string().max(120),
    // Обрабатываем конструкцию: serverName.
    serverName: z.string().max(200),
    // Обрабатываем конструкцию: pingMs.
    pingMs: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: status.
    status: XrayStatusSchema,
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const UpdateBackupInfoSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: path.
    path: z.string().max(600),
    // Обрабатываем конструкцию: timestamp.
    timestamp: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: size.
    size: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: version.
    version: z.string().max(32),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SystemInfoSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: os.
    os: z.string().max(120),
    // Обрабатываем конструкцию: osVersion.
    osVersion: z.string().max(64),
    // Обрабатываем конструкцию: osBuild.
    osBuild: z.string().max(64),
    // Обрабатываем конструкцию: arch.
    arch: z.string().max(32),
    // Обрабатываем конструкцию: tauriVersion.
    tauriVersion: z.string().max(32),
    // Обрабатываем конструкцию: rustVersion.
    rustVersion: z.string().max(32),
    // Обрабатываем конструкцию: appVersion.
    appVersion: z.string().max(32),
    // Обрабатываем конструкцию: webviewVersion.
    webviewVersion: z.string().max(32),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const VpnConfigInfoSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: id.
    id: z.string().max(64),
    // Обрабатываем конструкцию: name.
    name: z.string().max(120),
    // Обрабатываем конструкцию: path.
    path: z.string().max(600),
    // Обрабатываем конструкцию: endpoint.
    endpoint: z.string().max(200),
    // Обрабатываем конструкцию: address.
    address: z.array(z.string().max(64)).max(16),
    // Обрабатываем конструкцию: dns.
    dns: z.array(z.string().max(64)).max(16),
    // Обрабатываем конструкцию: allowedIps.
    allowedIps: z.array(z.string().max(64)).max(64),
    // Обрабатываем конструкцию: size.
    size: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: importedAt.
    importedAt: z.number().int().nonnegative(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const VpnStatusSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: state.
    state: z.string().max(32),
    // Обрабатываем конструкцию: interface.
    interface: z.string().max(64).nullable(),
    // Обрабатываем конструкцию: endpoint.
    endpoint: z.string().max(200).nullable(),
    // Обрабатываем конструкцию: handshakeAt.
    handshakeAt: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: bytesIn.
    bytesIn: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: bytesOut.
    bytesOut: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: uptimeSec.
    uptimeSec: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: error.
    error: z.string().max(400).nullable(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: const StrategyFilterGroupSchema = z .object({ args: z.a….
const StrategyFilterGroupSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: args.
    args: z.array(z.string().max(512)).max(64),
    // Обрабатываем конструкцию: usesGeneralHostlist.
    usesGeneralHostlist: z.boolean(),
    // Обрабатываем конструкцию: usesAllIpset.
    usesAllIpset: z.boolean(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: const StrategyConfigSchema = z .object({ sourceFilename….
const StrategyConfigSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: sourceFilename.
    sourceFilename: z.string().max(255),
    // Обрабатываем конструкцию: winwsPath.
    winwsPath: z.string().max(600),
    // Обрабатываем конструкцию: wfTcp.
    wfTcp: z.string().max(512).nullable(),
    // Обрабатываем конструкцию: wfUdp.
    wfUdp: z.string().max(512).nullable(),
    // Обрабатываем конструкцию: groups.
    groups: z.array(StrategyFilterGroupSchema).max(64),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const StrategyInfoSchema = z
  // Продолжаем цепочку вызовов.
  .object({
    // Обрабатываем конструкцию: id.
    id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
    // Обрабатываем конструкцию: name.
    name: z.string().max(160),
    // Обрабатываем конструкцию: filename.
    filename: z.string().max(255),
    // Обрабатываем конструкцию: path.
    path: z.string().max(600),
    // Обрабатываем конструкцию: description.
    description: z.string().max(2000),
    // Обрабатываем конструкцию: services.
    services: z.array(z.enum(SERVICE_TYPES)).max(64),
    // Обрабатываем конструкцию: techniques.
    techniques: z.array(z.enum(TECHNIQUE_IDS)).max(64),
    // Обрабатываем конструкцию: fileType.
    fileType: z.enum(STRATEGY_FILE_TYPES),
    // Обрабатываем конструкцию: status.
    status: z.enum(STRATEGY_STATUSES),
    // Обрабатываем конструкцию: version.
    version: z.string().max(32).nullable(),
    // Обрабатываем конструкцию: size.
    size: z.number().int().nonnegative(),
    // Обрабатываем конструкцию: modifiedAt.
    modifiedAt: z.number().int().nonnegative().nullable(),
    // Обрабатываем конструкцию: config.
    config: StrategyConfigSchema.nullable(),
    // Закрываем текущий блок.
  })
  // Продолжаем цепочку вызовов.
  .strict();
// — разделитель логических блоков —
