// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/userCommands.
import { pickSettingsFile, saveSettingsFile } from "@/lib/userCommands";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { APP_VERSION } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/settingsSchema.
import { validateSettings } from "@/lib/settingsSchema";
// Импортируем зависимости из модуля @/types.
import type { AppSettings } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SETTINGS_EXPORT_VERSION = 1;
// — разделитель логических блоков —

// Объявляем интерфейс SettingsExportFile с контрактом данных.
interface SettingsExportFile {
  // Обрабатываем конструкцию: version.
  version: number;
  // Обрабатываем конструкцию: exportedAt.
  exportedAt: string;
  // Обрабатываем конструкцию: appVersion.
  appVersion: string;
  // Обрабатываем конструкцию: settings.
  settings: Omit<AppSettings, "lastStrategyId" | "strategyUpdates"> & {
    // Обрабатываем конструкцию: strategyUpdates.
    strategyUpdates: Omit<
      // Обрабатываем конструкцию: AppSettings.
      AppSettings["strategyUpdates"],
      // Обрабатываем конструкцию: ignoredVersions.
      "ignoredVersions" | "lastCheckAt"
      // Продолжаем выражение.
    >;
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию exportName.
function exportName(): string {
  // Обрабатываем конструкцию: const date = new Date().toISOString().slice(0, 10).
  const date = new Date().toISOString().slice(0, 10);
  // — разделитель логических блоков —

  // Возвращаем результат: zapret-manager-settings-${date}.json.
  return `zapret-manager-settings-${date}.json`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function serializeSettings(settings: AppSettings): string {
  // Обрабатываем конструкцию: const { lastStrategyId, strategyUpdates, ...rest } = se….
  const { lastStrategyId, strategyUpdates, ...rest } = settings;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: void lastStrategyId.
  void lastStrategyId;
  // Обрабатываем конструкцию: void strategyUpdates.
  void strategyUpdates;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const payload: SettingsExportFile = { version: SETTINGS….
  const payload: SettingsExportFile = {
    // Обрабатываем конструкцию: version.
    version: SETTINGS_EXPORT_VERSION,
    // Обрабатываем конструкцию: exportedAt.
    exportedAt: new Date().toISOString(),
    // Обрабатываем конструкцию: appVersion.
    appVersion: APP_VERSION,
    // Обрабатываем конструкцию: settings.
    settings: {
      // Разворачиваем ...rest в коллекцию.
      ...rest,
      // Обрабатываем конструкцию: strategyUpdates.
      strategyUpdates: {
        // Обрабатываем конструкцию: autoCheck.
        autoCheck: settings.strategyUpdates.autoCheck,
        // Обрабатываем конструкцию: checkIntervalHours.
        checkIntervalHours: settings.strategyUpdates.checkIntervalHours,
        // Обрабатываем конструкцию: autoDownload.
        autoDownload: settings.strategyUpdates.autoDownload,
        // Обрабатываем конструкцию: githubRepo.
        githubRepo: settings.strategyUpdates.githubRepo,
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    },
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: JSON.stringify(payload, null, 2).
  return JSON.stringify(payload, null, 2);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function deserializeSettings(json: string): AppSettings {
  // Обрабатываем конструкцию: const parsed: unknown = JSON.parse(json).
  const parsed: unknown = JSON.parse(json);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof parsed !== object || parsed === null.
  if (typeof parsed !== "object" || parsed === null) {
    // Выбрасываем исключение throw new Error(translateKey(settingsFile.noObject….
    throw new Error(translateKey("settingsFile.noObject"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const payload = parsed as Partial<SettingsExportFile>.
  const payload = parsed as Partial<SettingsExportFile>;
  // Обрабатываем конструкцию: const body = payload.settings ?? parsed.
  const body = payload.settings ?? parsed;
  // — разделитель логических блоков —

  // Возвращаем результат: validateSettings(body).
  return validateSettings(body);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function exportSettings(settings: AppSettings): Promise<boolean> {
  // Обрабатываем конструкцию: const saved = await saveSettingsFile( translateKey(sett….
  const saved = await saveSettingsFile(
    // Обрабатываем конструкцию: translateKey.
    translateKey("settings.common.export"),
    // Обрабатываем конструкцию: exportName.
    exportName(),
    // Обрабатываем конструкцию: serializeSettings.
    serializeSettings(settings)
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: saved !== null.
  return saved !== null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function importSettings(): Promise<AppSettings | null> {
  // Обрабатываем конструкцию: const content = await pickSettingsFile( translateKey(se….
  const content = await pickSettingsFile(
    // Обрабатываем конструкцию: translateKey.
    translateKey("settings.common.import")
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: content === null.
  if (content === null) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: deserializeSettings(content).
  return deserializeSettings(content);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
