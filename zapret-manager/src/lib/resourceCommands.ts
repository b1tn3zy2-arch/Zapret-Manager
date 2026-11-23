// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke, secureInvokeValidated } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @/types/ipcSchemas.
import {
  // Подключаем именованный импорт InitReportSchema.
  InitReportSchema,
  // Подключаем именованный импорт IntegrityReportSchema.
  IntegrityReportSchema,
  // Подключаем именованный импорт RestoreReportSchema.
  RestoreReportSchema,
  // Закрываем текущий блок.
} from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/types.
import type { InitReport, IntegrityReport, RestoreReport } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function initResources(): Promise<InitReport> {
  // Возвращаем результат: secureInvokeValidated(init_resources, InitReportSchema).
  return secureInvokeValidated("init_resources", InitReportSchema);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function checkIntegrity(): Promise<IntegrityReport> {
  // Возвращаем результат: secureInvokeValidated( check_resources_integrity, Integ….
  return secureInvokeValidated(
    // Обрабатываем конструкцию: check_resources_integrity.
    "check_resources_integrity",
    // Обрабатываем конструкцию: IntegrityReportSchema.
    IntegrityReportSchema
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function restoreBundled(): Promise<RestoreReport> {
  // Возвращаем результат: secureInvokeValidated( restore_bundled_strategies, Rest….
  return secureInvokeValidated(
    // Обрабатываем конструкцию: restore_bundled_strategies.
    "restore_bundled_strategies",
    // Обрабатываем конструкцию: RestoreReportSchema.
    RestoreReportSchema
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function fetchResourcesVersion(): Promise<string> {
  // Возвращаем результат: secureInvoke<string>(get_resources_version).
  return secureInvoke<string>("get_resources_version");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function fetchResourcesLayout(): Promise<string[]> {
  // Возвращаем результат: secureInvoke<string[]>(get_resources_layout).
  return secureInvoke<string[]>("get_resources_layout");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function fetchStrategiesPath(): Promise<string> {
  // Возвращаем результат: secureInvoke<string>(get_resources_strategies_path).
  return secureInvoke<string>("get_resources_strategies_path");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function readLicense(name: string): Promise<string> {
  // Возвращаем результат: secureInvoke<string>(read_license_text, { name }).
  return secureInvoke<string>("read_license_text", { name });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
