import { useEffect } from "react";

import { useUpdater } from "@/hooks/useUpdater";
import { UPDATE_CHECK_DELAY_MS } from "@/lib/constants";
import { useSettingsStore } from "@/stores/useSettingsStore";

const HOUR_MS = 60 * 60 * 1000;
const UPDATE_DEFAULT_INTERVAL_HOURS = 24;

export function useAutoUpdateCheck(): void {
  const check = useUpdater().check;

  useEffect(() => {
    const schedule = (): number => {
      const store = useSettingsStore.getState();
      const { settings } = store;

      if (!store.loaded || settings.strategiesFolder === "") {
        return window.setTimeout(schedule, UPDATE_CHECK_DELAY_MS);
      }

      void check();

      return window.setTimeout(
        schedule,
        UPDATE_DEFAULT_INTERVAL_HOURS * HOUR_MS
      );
    };

    const timer = schedule();

    return () => {
      window.clearTimeout(timer);
    };
  }, [check]);
}
