import { useEffect } from "react";

import { useUpdater } from "@/hooks/useUpdater";
import {
  UPDATE_CHECK_DELAY_MS,
  UPDATE_MAX_INTERVAL_HOURS,
  UPDATE_MIN_INTERVAL_HOURS,
} from "@/lib/constants";
import { useSettingsStore } from "@/stores/useSettingsStore";

const HOUR_MS = 60 * 60 * 1000;

export function useAutoUpdateCheck(): void {
  const check = useUpdater().check;

  useEffect(() => {
    const schedule = (): number => {
      const store = useSettingsStore.getState();
      const { settings } = store;

      if (
        !store.loaded ||
        !settings.strategyUpdates.autoCheck ||
        settings.strategiesFolder === ""
      ) {
        return window.setTimeout(schedule, UPDATE_CHECK_DELAY_MS);
      }

      const hours = Math.min(
        Math.max(
          settings.strategyUpdates.checkIntervalHours,
          UPDATE_MIN_INTERVAL_HOURS
        ),
        UPDATE_MAX_INTERVAL_HOURS
      );

      void check();

      return window.setTimeout(schedule, hours * HOUR_MS);
    };

    const timer = schedule();

    return () => {
      window.clearTimeout(timer);
    };
  }, [check]);
}
