export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "downloaded"
  | "extracting"
  | "installing"
  | "ready"
  | "error"
  | "up-to-date";

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  downloadUrl: string;
  assetName: string;
  size: number;
  isNewer: boolean;
  ignored: boolean;
}

export interface DownloadProgress {
  downloaded: number;
  total: number;
  percent: number;
  speed: number;
  eta: number | null;
}

export interface UpdateBackupInfo {
  path: string;
  timestamp: number;
  size: number;
  version: string;
}

export interface InstallReport {
  version: string;
  files: number;
  preservedEntries: number;
  backupPath: string;
  checkUpdatesDisabled: boolean;
}
