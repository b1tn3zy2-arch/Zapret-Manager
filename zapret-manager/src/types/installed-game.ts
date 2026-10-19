export type InstalledGamePlatform =
  | "steam"
  | "epic"
  | "gog"
  | "ubisoft"
  | "riot"
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
  | "riot"
  | "ea"
  | "battlenet"
  | "knownFolder"
  | "userFolder";

export type InstalledGameAnticheat = "battleye" | "eac" | "none";

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
