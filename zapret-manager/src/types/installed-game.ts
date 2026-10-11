export type InstalledGamePlatform =
  | "steam"
  | "epic"
  | "gog"
  | "ubisoft"
  | "ea"
  | "battleNet"
  | "custom"
  | "unknown";

export type InstalledGameSource =
  | "registry"
  | "steam"
  | "epic"
  | "gog"
  | "ubisoft"
  | "ea"
  | "battlenet"
  | "knownFolder"
  | "userFolder";

export type InstalledGameAnticheat = "battleye" | "eac" | "none";

export type GameBypassMode = "vpn" | "dpi";

export interface InstalledGame {
  id: string;
  name: string;
  appid?: string;
  platform: InstalledGamePlatform;
  source: InstalledGameSource;
  installPath: string;
  executablePath: string;
  launchArgs?: string;
  coverUrl?: string;
  gameSettingsId?: string;
  anticheat?: InstalledGameAnticheat;
  bypassMode?: GameBypassMode;
  lastLaunchedAt?: number;
  launchCount: number;
  manual?: boolean;
}

export interface GameScanProgress {
  source: InstalledGameSource;
  found: number;
  current: string;
}

export type ScanStatus = "idle" | "scanning" | "done" | "error";
