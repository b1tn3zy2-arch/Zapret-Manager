// Обрабатываем конструкцию: export.
export type UpdateStatus =
  // Обрабатываем конструкцию: | idle | checking | available | downloading | downloade….
  | "idle"
  // Продолжаем выражение.
  | "checking"
  // Продолжаем выражение.
  | "available"
  // Продолжаем выражение.
  | "downloading"
  // Продолжаем выражение.
  | "downloaded"
  // Продолжаем выражение.
  | "extracting"
  // Продолжаем выражение.
  | "installing"
  // Продолжаем выражение.
  | "ready"
  // Продолжаем выражение.
  | "error"
  // Продолжаем выражение.
  | "up-to-date";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UpdateInfo {
  // Обрабатываем конструкцию: available.
  available: boolean;
  // Обрабатываем конструкцию: currentVersion.
  currentVersion: string;
  // Обрабатываем конструкцию: latestVersion.
  latestVersion: string;
  // Обрабатываем конструкцию: releaseName.
  releaseName: string;
  // Обрабатываем конструкцию: releaseNotes.
  releaseNotes: string;
  // Обрабатываем конструкцию: publishedAt.
  publishedAt: string;
  // Обрабатываем конструкцию: downloadUrl.
  downloadUrl: string;
  // Обрабатываем конструкцию: assetName.
  assetName: string;
  // Сохраняем пояснение разработчика: Хеш архива sha256:... по данным GitHub.
  /** Хеш архива `sha256:...` по данным GitHub. */
  // Обрабатываем конструкцию: digest.
  digest: string;
  // Обрабатываем конструкцию: size.
  size: number;
  // Обрабатываем конструкцию: isNewer.
  isNewer: boolean;
  // Обрабатываем конструкцию: ignored.
  ignored: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface DownloadProgress {
  // Обрабатываем конструкцию: downloaded.
  downloaded: number;
  // Обрабатываем конструкцию: total.
  total: number;
  // Обрабатываем конструкцию: percent.
  percent: number;
  // Обрабатываем конструкцию: speed.
  speed: number;
  // Обрабатываем конструкцию: eta.
  eta: number | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UpdateBackupInfo {
  // Обрабатываем конструкцию: path.
  path: string;
  // Обрабатываем конструкцию: timestamp.
  timestamp: number;
  // Обрабатываем конструкцию: size.
  size: number;
  // Обрабатываем конструкцию: version.
  version: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface InstallReport {
  // Обрабатываем конструкцию: version.
  version: string;
  // Обрабатываем конструкцию: files.
  files: number;
  // Обрабатываем конструкцию: preservedEntries.
  preservedEntries: number;
  // Обрабатываем конструкцию: backupPath.
  backupPath: string;
  // Обрабатываем конструкцию: checkUpdatesDisabled.
  checkUpdatesDisabled: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
