import { useCallback } from "react";

import * as commands from "@/lib/vpnCommands";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useVpnStore } from "@/stores/useVpnStore";
import type { VpnConfigInfo } from "@/types";

export interface UseVpnImportResult {
  importConfig: () => Promise<VpnConfigInfo | null>;
  importConfigFromClipboard: () => Promise<VpnConfigInfo | null>;
}

export function useVpnImport(): UseVpnImportResult {
  const addLog = useLogsStore((state) => state.addLog);

  const store = useCallback(
    (config: VpnConfigInfo, origin: string): VpnConfigInfo => {
      useVpnStore.getState().addConfig(config);
      addLog({
        level: "success",
        source: "vpn",
        message: `Импортирован конфиг${origin}: ${config.name}`,
      });

      return config;
    },
    [addLog]
  );

  const fail = useCallback(
    (caught: unknown, origin: string): null => {
      const message = toErrorMessage(caught);

      useVpnStore.getState().setError(message);
      addLog({
        level: "error",
        source: "vpn",
        message: `${origin}: ${message}`,
      });

      return null;
    },
    [addLog]
  );

  const importConfig = useCallback(async (): Promise<VpnConfigInfo | null> => {
    useVpnStore.getState().setError(null);

    try {
      const config = await commands.importConfigFromDialog();

      return config === null ? null : store(config, "");
    } catch (caught) {
      return fail(caught, "Импорт конфига не удался");
    }
  }, [fail, store]);

  const importConfigFromClipboard =
    useCallback(async (): Promise<VpnConfigInfo | null> => {
      useVpnStore.getState().setError(null);

      let text: string;

      try {
        text = await navigator.clipboard.readText();
      } catch {
        return null;
      }

      if (text.trim() === "") {
        return null;
      }

      try {
        const config = await commands.importConfigFromText(text);

        return store(config, " из буфера");
      } catch (caught) {
        return fail(caught, "Импорт из буфера не удался");
      }
    }, [fail, store]);

  return { importConfig, importConfigFromClipboard };
}
