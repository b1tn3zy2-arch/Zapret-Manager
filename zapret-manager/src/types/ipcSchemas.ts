import { z } from "zod";

export const UpdateInfoSchema = z
  .object({
    available: z.boolean(),
    currentVersion: z.string().max(32),
    latestVersion: z.string().max(32),
    releaseName: z.string().max(200),
    releaseNotes: z.string().max(20_000),
    publishedAt: z.string().max(64),
    downloadUrl: z.string().max(512),
    assetName: z.string().max(255),
    size: z.number().int().nonnegative(),
    isNewer: z.boolean(),
    ignored: z.boolean(),
  })
  .strict();

export const SystemInfoSchema = z
  .object({
    os: z.string().max(120),
    osVersion: z.string().max(64),
    osBuild: z.string().max(64),
    arch: z.string().max(32),
    tauriVersion: z.string().max(32),
    rustVersion: z.string().max(32),
    appVersion: z.string().max(32),
    webviewVersion: z.string().max(32),
  })
  .strict();

export const VpnConfigInfoSchema = z
  .object({
    id: z.string().max(64),
    name: z.string().max(120),
    path: z.string().max(600),
    endpoint: z.string().max(200),
    address: z.array(z.string().max(64)).max(16),
    dns: z.array(z.string().max(64)).max(16),
    allowedIps: z.array(z.string().max(64)).max(64),
    size: z.number().int().nonnegative(),
    importedAt: z.number().int().nonnegative(),
  })
  .strict();

export const VpnStatusSchema = z
  .object({
    state: z.string().max(32),
    interface: z.string().max(64).nullable(),
    endpoint: z.string().max(200).nullable(),
    handshakeAt: z.number().int().nonnegative().nullable(),
    bytesIn: z.number().int().nonnegative().nullable(),
    bytesOut: z.number().int().nonnegative().nullable(),
    uptimeSec: z.number().int().nonnegative().nullable(),
    error: z.string().max(400).nullable(),
  })
  .strict();

export const StrategyInfoSchema = z
  .object({
    id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
    name: z.string().max(160),
    filename: z.string().max(255),
    path: z.string().max(600),
    description: z.string().max(2000),
    services: z.array(z.string().max(48)).max(64),
    techniques: z.array(z.string().max(64)).max(64),
    fileType: z.string().max(32),
    status: z.string().max(32),
    version: z.string().max(32).nullable(),
    size: z.number().int().nonnegative(),
    modifiedAt: z.number().int().nonnegative().nullable(),
  })
  .strict();
