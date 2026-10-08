import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

import { RESOURCE_PROGRESS_EVENT, STRATEGIES_SUBDIR } from "@/lib/constants";
import * as commands from "@/lib/resourceCommands";
import { clampPercent } from "@/lib/resources";
import { toErrorMessage } from "@/lib/utils";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { InitProgress, InitReport, IntegrityReport } from "@/types";

export interface ResourceInitState {
  isInitializing: boolean;
  progress: InitProgress | null;
  error: string | null;
  report: InitReport | null;
  version: string;
  integrity: IntegrityReport | null;
}

export interface UseResourceInitResult extends ResourceInitState {
  checkIntegrity: () => Promise<IntegrityReport | null>;
}

const INITIAL: ResourceInitState = {
  isInitializing: false,
  progress: null,
  error: null,
  report: null,
  version: "",
  integrity: null,
};

const IDLE_PROGRESS: InitProgress = {
  stage: "idle",
  percent: 0,
  currentFile: "",
};

let state: ResourceInitState = INITIAL;
let listeners: ((next: ResourceInitState) => void)[] = [];
let started = false;

function setState(patch: Partial<ResourceInitState>): void {
  state = { ...state, ...patch };

  for (const listener of listeners) {
    listener(state);
  }
}

function subscribe(listener: (next: ResourceInitState) => void): () => void {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

function bindLifecycle(): void {
  const subscription = listen<InitProgress>(
    RESOURCE_PROGRESS_EVENT,
    (event) => {
      setState({
        progress: {
          stage: event.payload.stage,
          percent: clampPercent(event.payload.percent),
          currentFile: event.payload.currentFile,
        },
      });
    }
  );

  void subscription.catch(() => undefined);
}

async function runInit(): Promise<void> {
  setState({ isInitializing: true, progress: IDLE_PROGRESS });

  try {
    const report = await commands.initResources();

    setState({
      report,
      progress: null,
      error: null,
      isInitializing: false,
    });

    await adoptStrategiesFolder(report);
  } catch (caught) {
    setState({ error: toErrorMessage(caught), isInitializing: false });
  }
}

async function adoptStrategiesFolder(report: InitReport): Promise<void> {
  if (!report.available) {
    return;
  }

  const store = useSettingsStore.getState();

  if (store.settings.strategiesFolder !== "") {
    return;
  }

  const layout = await commands.fetchResourcesLayout();
  const strategiesDir = await commands.fetchStrategiesPath();

  if (!layout.includes(STRATEGIES_SUBDIR) || strategiesDir === "") {
    return;
  }

  store.setStrategiesFolder(strategiesDir);
  await useSettingsStore.getState().saveToFile();
}

async function runVersion(): Promise<void> {
  try {
    setState({ version: await commands.fetchResourcesVersion() });
  } catch {
    return;
  }
}

function ensureStarted(): void {
  if (started) {
    return;
  }

  started = true;
  bindLifecycle();
  void runInit();
  void runVersion();
}

export function useResourceInit(): UseResourceInitResult {
  const [snapshot, setSnapshot] = useState<ResourceInitState>(state);

  useEffect(() => {
    ensureStarted();

    return subscribe(setSnapshot);
  }, []);

  const checkIntegrity = async (): Promise<IntegrityReport | null> => {
    try {
      const integrity = await commands.checkIntegrity();

      setState({ integrity });

      return integrity;
    } catch (caught) {
      setState({ error: toErrorMessage(caught) });

      return null;
    }
  };

  return { ...snapshot, checkIntegrity };
}
