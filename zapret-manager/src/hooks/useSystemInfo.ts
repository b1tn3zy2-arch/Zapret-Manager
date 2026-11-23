// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke, secureInvokeValidated } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/types/ipcSchemas.
import { SystemInfoSchema } from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/types.
import type { ConfigCheckReport, FolderKind, SystemInfo } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseSystemInfoResult {
  // Обрабатываем конструкцию: info.
  info: SystemInfo | null;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: refresh.
  refresh: () => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useSystemInfo(): UseSystemInfoResult {
  // Обрабатываем конструкцию: const [info, setInfo] = useState<SystemInfo | null>(nul….
  const [info, setInfo] = useState<SystemInfo | null>(null);
  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const refresh = useCallback(async (): Promise<void> => ….
  const refresh = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: setInfo.
      setInfo(await secureInvokeValidated("get_system_info", SystemInfoSchema));
      // Обрабатываем конструкцию: setError.
      setError(null);
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setError.
      setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: let cancelled = false.
    let cancelled = false;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void secureInvokeValidated(get_system_info, SystemInfoS….
    void secureInvokeValidated("get_system_info", SystemInfoSchema)
      // Продолжаем цепочку вызовов.
      .then((value) => {
        // Проверяем бизнес-условие: !cancelled.
        if (!cancelled) {
          // Обрабатываем конструкцию: setInfo.
          setInfo(value);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .catch((caught: unknown) => {
        // Проверяем бизнес-условие: !cancelled.
        if (!cancelled) {
          // Обрабатываем конструкцию: setError.
          setError(toErrorMessage(caught));
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { cancelled = true; }.
    return () => {
      // Обрабатываем конструкцию: cancelled.
      cancelled = true;
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: { info, error, refresh }.
  return { info, error, refresh };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function openFolder(
  // Обрабатываем конструкцию: kind.
  kind: FolderKind,
  // Обрабатываем конструкцию: strategiesDir.
  strategiesDir: string
  // Закрываем выражение или список аргументов.
): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke<null>(open_folder, { kind,….
  await secureInvoke<null>("open_folder", { kind, strategiesDir });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function verifyConfigs(
  // Обрабатываем конструкцию: strategiesDir.
  strategiesDir: string
  // Закрываем выражение или список аргументов.
): Promise<ConfigCheckReport> {
  // Возвращаем результат: secureInvoke<ConfigCheckReport>(verify_configs, { strat….
  return secureInvoke<ConfigCheckReport>("verify_configs", {
    // Передаём поле strategiesDir в объект.
    strategiesDir,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function deleteAllBackups(strategiesDir: string): Promise<number> {
  // Возвращаем результат: secureInvoke<number>(delete_all_backups, { strategiesDi….
  return secureInvoke<number>("delete_all_backups", { strategiesDir });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Удаляет файлы журналов с диска и возвращает их количество.
/** Удаляет файлы журналов с диска и возвращает их количество. */
// Обрабатываем конструкцию: export.
export async function deleteAllLogs(): Promise<number> {
  // Возвращаем результат: secureInvoke<number>(delete_all_logs).
  return secureInvoke<number>("delete_all_logs");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Убирает журналы старше указанного срока и возвращает их коли…
/** Убирает журналы старше указанного срока и возвращает их количество. */
// Обрабатываем конструкцию: export.
export async function pruneLogs(retentionDays: number): Promise<number> {
  // Возвращаем результат: secureInvoke<number>(prune_logs, { retentionDays }).
  return secureInvoke<number>("prune_logs", { retentionDays });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Запускает деинсталлятор в тихом режиме вместе с удалением …
 * Запускает деинсталлятор в тихом режиме вместе с удалением настроек,
 // Сохраняем пояснение разработчика: * логов и кэша. Приложение должно уйти сразу после вызова.
 * логов и кэша. Приложение должно уйти сразу после вызова.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function fullUninstall(): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke<null>(full_uninstall).
  await secureInvoke<null>("full_uninstall");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Завершение приложения с остановкой процессов обхода.
/** Завершение приложения с остановкой процессов обхода. */
// Обрабатываем конструкцию: export.
export async function quitApp(): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke<null>(quit_app).
  await secureInvoke<null>("quit_app");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
