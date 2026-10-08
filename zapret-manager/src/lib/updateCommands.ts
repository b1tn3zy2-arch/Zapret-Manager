import { secureInvoke, secureInvokeValidated } from "@/lib/secureInvoke";
import { validateFilePath, validateVersion } from "@/lib/sanitize";
import { StrategyInfoSchema, UpdateInfoSchema } from "@/types/ipcSchemas";

import type {
  InstallReport,
  Strategy,
  UpdateBackupInfo,
  UpdateInfo,
} from "@/types";

export async function scanStrategies(folder: string): Promise<Strategy[]> {
  const check = validateFilePath(folder);

  if (!check.valid) {
    throw new Error(check.message ?? "Недопустимая папка стратегий");
  }

  return secureInvokeValidated("scan_strategies", StrategyInfoSchema.array(), {
    folder,
  }) as Promise<Strategy[]>;
}

export async function requestUpdateCheck(
  repo: string,
  ignoredVersions: string[],
  strategiesDir: string
): Promise<UpdateInfo> {
  return secureInvokeValidated("check_for_updates", UpdateInfoSchema, {
    repo,
    ignoredVersions,
    strategiesDir,
  });
}

export async function downloadArchive(
  url: string,
  version: string
): Promise<string> {
  const versionCheck = validateVersion(version);

  if (!versionCheck.valid) {
    throw new Error(versionCheck.message ?? "Недопустимая версия");
  }

  return secureInvoke<string>("download_update", { url, version });
}

export async function installArchive(
  archivePath: string,
  strategiesDir: string,
  version: string
): Promise<InstallReport> {
  return secureInvoke<InstallReport>("install_update", {
    archivePath,
    strategiesDir,
    version,
  });
}

export async function cancelDownload(): Promise<boolean> {
  return secureInvoke<boolean>("cancel_download");
}

export async function fetchBackups(
  strategiesDir: string
): Promise<UpdateBackupInfo[]> {
  return secureInvoke<UpdateBackupInfo[]>("list_update_backups", {
    strategiesDir,
  });
}

export async function restoreBackup(
  backupPath: string,
  strategiesDir: string
): Promise<number> {
  const check = validateFilePath(backupPath);

  if (!check.valid) {
    throw new Error(check.message ?? "Некорректный путь к бэкапу");
  }

  return secureInvoke<number>("restore_from_backup", {
    backupPath,
    strategiesDir,
  });
}

export async function markVersion(
  strategiesDir: string,
  version: string
): Promise<boolean> {
  const versionCheck = validateVersion(version);

  if (!versionCheck.valid) {
    throw new Error(versionCheck.message ?? "Некорректная версия");
  }

  return secureInvoke<boolean>("set_current_version", {
    strategiesDir,
    version,
  });
}
