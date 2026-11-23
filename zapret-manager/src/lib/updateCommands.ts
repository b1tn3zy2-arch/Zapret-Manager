// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/sanitize.
import { validateFilePath, validateVersion } from "@/lib/sanitize";
// Импортируем зависимости из модуля @/types/ipcSchemas.
import {
  // Подключаем именованный импорт StrategyInfoSchema.
  StrategyInfoSchema,
  // Подключаем именованный импорт UpdateBackupInfoSchema.
  UpdateBackupInfoSchema,
  // Подключаем именованный импорт UpdateInfoSchema.
  UpdateInfoSchema,
  // Закрываем текущий блок.
} from "@/types/ipcSchemas";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke, secureInvokeValidated } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @/types.
import type {
  // Подключаем именованный импорт InstallReport.
  InstallReport,
  // Подключаем именованный импорт Strategy.
  Strategy,
  // Подключаем именованный импорт UpdateBackupInfo.
  UpdateBackupInfo,
  // Подключаем именованный импорт UpdateInfo.
  UpdateInfo,
  // Закрываем текущий блок.
} from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function scanStrategies(folder: string): Promise<Strategy[]> {
  // Обрабатываем конструкцию: const check = validateFilePath(folder).
  const check = validateFilePath(folder);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !check.valid.
  if (!check.valid) {
    // Выбрасываем исключение throw new Error( check.message ?? translateKey(val….
    throw new Error(
      // Обрабатываем конструкцию: check.
      check.message ?? translateKey("validation.invalidStrategiesFolder")
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: secureInvokeValidated(scan_strategies, StrategyInfoSche….
  return secureInvokeValidated("scan_strategies", StrategyInfoSchema.array(), {
    // Передаём поле folder в объект.
    folder,
    // Закрываем текущий блок.
  }) as Promise<Strategy[]>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function requestUpdateCheck(
  // Обрабатываем конструкцию: repo.
  repo: string,
  // Обрабатываем конструкцию: ignoredVersions.
  ignoredVersions: string[],
  // Обрабатываем конструкцию: strategiesDir.
  strategiesDir: string
  // Закрываем выражение или список аргументов.
): Promise<UpdateInfo> {
  // Возвращаем результат: secureInvokeValidated(check_for_updates, UpdateInfoSche….
  return secureInvokeValidated("check_for_updates", UpdateInfoSchema, {
    // Передаём поле repo в объект.
    repo,
    // Передаём поле ignoredVersions в объект.
    ignoredVersions,
    // Передаём поле strategiesDir в объект.
    strategiesDir,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function downloadArchive(
  // Обрабатываем конструкцию: url.
  url: string,
  // Обрабатываем конструкцию: version.
  version: string,
  // Обрабатываем конструкцию: digest.
  digest: string
  // Закрываем выражение или список аргументов.
): Promise<string> {
  // Обрабатываем конструкцию: const versionCheck = validateVersion(version).
  const versionCheck = validateVersion(version);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !versionCheck.valid.
  if (!versionCheck.valid) {
    // Выбрасываем исключение throw new Error( versionCheck.message ?? translate….
    throw new Error(
      // Обрабатываем конструкцию: versionCheck.
      versionCheck.message ?? translateKey("validation.invalidVersion")
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: secureInvoke<string>(download_update, { url, version, e….
  return secureInvoke<string>("download_update", {
    // Передаём поле url в объект.
    url,
    // Передаём поле version в объект.
    version,
    // Обрабатываем конструкцию: expectedDigest.
    expectedDigest: digest,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function installArchive(
  // Обрабатываем конструкцию: archivePath.
  archivePath: string,
  // Обрабатываем конструкцию: strategiesDir.
  strategiesDir: string,
  // Обрабатываем конструкцию: version.
  version: string
  // Закрываем выражение или список аргументов.
): Promise<InstallReport> {
  // Возвращаем результат: secureInvoke<InstallReport>(install_update, { archivePa….
  return secureInvoke<InstallReport>("install_update", {
    // Передаём поле archivePath в объект.
    archivePath,
    // Передаём поле strategiesDir в объект.
    strategiesDir,
    // Передаём поле version в объект.
    version,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function cancelDownload(): Promise<boolean> {
  // Возвращаем результат: secureInvoke<boolean>(cancel_download).
  return secureInvoke<boolean>("cancel_download");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function fetchBackups(
  // Обрабатываем конструкцию: strategiesDir.
  strategiesDir: string
  // Закрываем выражение или список аргументов.
): Promise<UpdateBackupInfo[]> {
  // Возвращаем результат: secureInvokeValidated( list_update_backups, UpdateBacku….
  return secureInvokeValidated(
    // Обрабатываем конструкцию: list_update_backups.
    "list_update_backups",
    // Обрабатываем конструкцию: UpdateBackupInfoSchema.
    UpdateBackupInfoSchema.array(),
    // Открываем объектный литерал.
    {
      // Передаём поле strategiesDir в объект.
      strategiesDir,
      // Закрываем текущий блок.
    }
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function restoreBackup(
  // Обрабатываем конструкцию: backupPath.
  backupPath: string,
  // Обрабатываем конструкцию: strategiesDir.
  strategiesDir: string
  // Закрываем выражение или список аргументов.
): Promise<number> {
  // Обрабатываем конструкцию: const check = validateFilePath(backupPath).
  const check = validateFilePath(backupPath);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !check.valid.
  if (!check.valid) {
    // Выбрасываем исключение throw new Error( check.message ?? translateKey(val….
    throw new Error(
      // Обрабатываем конструкцию: check.
      check.message ?? translateKey("validation.invalidBackupPath")
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: secureInvoke<number>(rollback_update, { backupPath, str….
  return secureInvoke<number>("rollback_update", {
    // Передаём поле backupPath в объект.
    backupPath,
    // Передаём поле strategiesDir в объект.
    strategiesDir,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function markVersion(
  // Обрабатываем конструкцию: strategiesDir.
  strategiesDir: string,
  // Обрабатываем конструкцию: version.
  version: string
  // Закрываем выражение или список аргументов.
): Promise<boolean> {
  // Обрабатываем конструкцию: const versionCheck = validateVersion(version).
  const versionCheck = validateVersion(version);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !versionCheck.valid.
  if (!versionCheck.valid) {
    // Выбрасываем исключение throw new Error( versionCheck.message ?? translate….
    throw new Error(
      // Обрабатываем конструкцию: versionCheck.
      versionCheck.message ?? translateKey("validation.invalidVersion")
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: secureInvoke<boolean>(set_current_version, { strategies….
  return secureInvoke<boolean>("set_current_version", {
    // Передаём поле strategiesDir в объект.
    strategiesDir,
    // Передаём поле version в объект.
    version,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
