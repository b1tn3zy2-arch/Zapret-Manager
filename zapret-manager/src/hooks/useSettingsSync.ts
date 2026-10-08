import { useEffect, useRef, useState } from "react";

import { SETTINGS_SAVED_INDICATOR_MS } from "@/lib/settingsConstants";
import { SETTINGS_SYNC_DEBOUNCE_MS } from "@/lib/defaults";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { SaveState } from "@/types";

const SAVED_INDICATOR_MS = SETTINGS_SAVED_INDICATOR_MS;

export interface SettingsSyncResult {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  saveState: SaveState;
}

export function useSettingsSync(): SettingsSyncResult {
  const settings = useSettingsStore((state) => state.settings);
  const loaded = useSettingsStore((state) => state.loaded);
  const loading = useSettingsStore((state) => state.loading);
  const error = useSettingsStore((state) => state.error);
  const saveState = useSettingsStore((state) => state.saveState);
  const loadFromFile = useSettingsStore((state) => state.loadFromFile);
  const saveToFile = useSettingsStore((state) => state.saveToFile);
  const setSaveState = useSettingsStore((state) => state.setSaveState);

  const [hydrated, setHydrated] = useState(false);
  const skipNextSave = useRef(true);
  const savedTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    void loadFromFile().finally(() => {
      if (!cancelled) {
        setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadFromFile]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void saveToFile();
    }, SETTINGS_SYNC_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [settings, hydrated, saveToFile]);

  useEffect(() => {
    if (saveState !== "saved") {
      return;
    }

    savedTimer.current = window.setTimeout(() => {
      setSaveState("idle");
      savedTimer.current = undefined;
    }, SAVED_INDICATOR_MS);

    return () => {
      if (savedTimer.current !== undefined) {
        window.clearTimeout(savedTimer.current);
        savedTimer.current = undefined;
      }
    };
  }, [saveState, setSaveState]);

  return { isLoaded: loaded, isLoading: loading, error, saveState };
}
