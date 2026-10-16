import { useCallback, useEffect, useState } from "react";

import { secureInvoke, secureInvokeValidated } from "@/lib/secureInvoke";
import { toErrorMessage } from "@/lib/utils";
import { SystemInfoSchema } from "@/types/ipcSchemas";
import type { ConfigCheckReport, FolderKind, SystemInfo } from "@/types";

export interface UseSystemInfoResult {
  info: SystemInfo | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSystemInfo(): UseSystemInfoResult {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setInfo(await secureInvokeValidated("get_system_info", SystemInfoSchema));
      setError(null);
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void secureInvokeValidated("get_system_info", SystemInfoSchema)
      .then((value) => {
        if (!cancelled) {
          setInfo(value);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(toErrorMessage(caught));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { info, error, refresh };
}

export async function openFolder(
  kind: FolderKind,
  strategiesDir: string
): Promise<void> {
  await secureInvoke<null>("open_folder", { kind, strategiesDir });
}

export async function verifyConfigs(
  strategiesDir: string
): Promise<ConfigCheckReport> {
  return secureInvoke<ConfigCheckReport>("verify_configs", {
    strategiesDir,
  });
}

export async function deleteAllBackups(strategiesDir: string): Promise<number> {
  return secureInvoke<number>("delete_all_backups", { strategiesDir });
}

/** Удаляет файлы журналов с диска и возвращает их количество. */
export async function deleteAllLogs(): Promise<number> {
  return secureInvoke<number>("delete_all_logs");
}

/** Убирает журналы старше указанного срока и возвращает их количество. */
export async function pruneLogs(retentionDays: number): Promise<number> {
  return secureInvoke<number>("prune_logs", { retentionDays });
}

/**
 * Запускает деинсталлятор в тихом режиме вместе с удалением настроек,
 * логов и кэша. Приложение должно уйти сразу после вызова.
 */
export async function fullUninstall(): Promise<void> {
  await secureInvoke<null>("full_uninstall");
}

/** Завершение приложения с остановкой процессов обхода. */
export async function quitApp(): Promise<void> {
  await secureInvoke<null>("quit_app");
}
