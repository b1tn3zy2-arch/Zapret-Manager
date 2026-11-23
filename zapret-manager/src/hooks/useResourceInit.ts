// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля react.
import { useEffect, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { RESOURCE_PROGRESS_EVENT, STRATEGIES_SUBDIR } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/resourceCommands.
import * as commands from "@/lib/resourceCommands";
// Импортируем зависимости из модуля @/lib/resources.
import { clampPercent } from "@/lib/resources";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { InitProgress, InitReport, IntegrityReport } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ResourceInitState {
  // Обрабатываем конструкцию: isInitializing.
  isInitializing: boolean;
  // Обрабатываем конструкцию: progress.
  progress: InitProgress | null;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: report.
  report: InitReport | null;
  // Обрабатываем конструкцию: version.
  version: string;
  // Обрабатываем конструкцию: integrity.
  integrity: IntegrityReport | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseResourceInitResult extends ResourceInitState {
  // Обрабатываем конструкцию: checkIntegrity.
  checkIntegrity: () => Promise<IntegrityReport | null>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const INITIAL: ResourceInitState = { isInitializing: fa….
const INITIAL: ResourceInitState = {
  // Обрабатываем конструкцию: isInitializing.
  isInitializing: false,
  // Обрабатываем конструкцию: progress.
  progress: null,
  // Обрабатываем конструкцию: error.
  error: null,
  // Обрабатываем конструкцию: report.
  report: null,
  // Обрабатываем конструкцию: version.
  version: "",
  // Обрабатываем конструкцию: integrity.
  integrity: null,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const IDLE_PROGRESS: InitProgress = { stage: idle, perc….
const IDLE_PROGRESS: InitProgress = {
  // Обрабатываем конструкцию: stage.
  stage: "idle",
  // Обрабатываем конструкцию: percent.
  percent: 0,
  // Обрабатываем конструкцию: currentFile.
  currentFile: "",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: let state: ResourceInitState = INITIAL.
let state: ResourceInitState = INITIAL;
// Обрабатываем конструкцию: let listeners: ((next: ResourceInitState) => void)[] = ….
let listeners: ((next: ResourceInitState) => void)[] = [];
// Обрабатываем конструкцию: let started = false.
let started = false;
// — разделитель логических блоков —

// Объявляем функцию setState.
function setState(patch: Partial<ResourceInitState>): void {
  // Обрабатываем конструкцию: state.
  state = { ...state, ...patch };
  // — разделитель логических блоков —

  // Перебираем элементы коллекции listeners.
  for (const listener of listeners) {
    // Обрабатываем конструкцию: listener.
    listener(state);
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию subscribe.
function subscribe(listener: (next: ResourceInitState) => void): () => void {
  // Обрабатываем конструкцию: listeners.
  listeners.push(listener);
  // — разделитель логических блоков —

  // Возвращаем результат: () => { listeners = listeners.filter((item) => item !==….
  return () => {
    // Обрабатываем конструкцию: listeners.
    listeners = listeners.filter((item) => item !== listener);
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function bindLifecycle(): Promise<void> {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Ожидаем завершение асинхронной операции await listen<InitProgress>(RESOURCE_PROGRESS_….
    await listen<InitProgress>(RESOURCE_PROGRESS_EVENT, (event) => {
      // Обрабатываем конструкцию: setState.
      setState({
        // Обрабатываем конструкцию: progress.
        progress: {
          // Обрабатываем конструкцию: stage.
          stage: event.payload.stage,
          // Обрабатываем конструкцию: percent.
          percent: clampPercent(event.payload.percent),
          // Обрабатываем конструкцию: currentFile.
          currentFile: event.payload.currentFile,
          // Закрываем текущий блок.
        },
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  } catch {
    // Сохраняем пояснение разработчика: // Без Tauri IPC прогресс не обновляется, но инициализация
    // Без Tauri IPC прогресс не обновляется, но инициализация
    // Сохраняем пояснение разработчика: // ресурсов всё равно должна запуститься.
    // ресурсов всё равно должна запуститься.
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function runInit(): Promise<void> {
  // Обрабатываем конструкцию: setState.
  setState({ isInitializing: true, progress: IDLE_PROGRESS });
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const report = await commands.initResources().
    const report = await commands.initResources();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setState.
    setState({
      // Передаём поле report в объект.
      report,
      // Обрабатываем конструкцию: progress.
      progress: null,
      // Обрабатываем конструкцию: error.
      error: null,
      // Обрабатываем конструкцию: isInitializing.
      isInitializing: false,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await adoptStrategiesFolder(report).
    await adoptStrategiesFolder(report);
    // Закрываем текущий блок.
  } catch (caught) {
    // Обрабатываем конструкцию: setState.
    setState({
      // Обрабатываем конструкцию: error.
      error: toErrorMessage(caught),
      // Обрабатываем конструкцию: isInitializing.
      isInitializing: false,
      // Обрабатываем конструкцию: progress.
      progress: null,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function adoptStrategiesFolder(report: InitReport): Promise<void> {
  // Проверяем бизнес-условие: !report.available.
  if (!report.available) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const store = useSettingsStore.getState().
  const store = useSettingsStore.getState();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: store.settings.strategiesFolder !==.
  if (store.settings.strategiesFolder !== "") {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const layout = await commands.fetchResourcesLayout().
  const layout = await commands.fetchResourcesLayout();
  // Обрабатываем конструкцию: const strategiesDir = await commands.fetchStrategiesPat….
  const strategiesDir = await commands.fetchStrategiesPath();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !Array.isArray(layout) || !layout.includes(STRATEGIES_S….
  if (
    // Изменяем значение выражения !Array.isArray(layout).
    !Array.isArray(layout) ||
    // Изменяем значение выражения !layout.includes(STRATEGIES_SUBDIR).
    !layout.includes(STRATEGIES_SUBDIR) ||
    // Обрабатываем конструкцию: strategiesDir.
    strategiesDir === ""
    // Закрываем выражение или список аргументов.
  ) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: store.
  store.setStrategiesFolder(strategiesDir);
  // Ожидаем завершение асинхронной операции await useSettingsStore.getState().saveToFile(….
  await useSettingsStore.getState().saveToFile();
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function runVersion(): Promise<void> {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: setState.
    setState({ version: await commands.fetchResourcesVersion() });
    // Закрываем текущий блок.
  } catch {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию ensureStarted.
function ensureStarted(): void {
  // Проверяем бизнес-условие: started.
  if (started) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: started.
  started = true;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: void (async () => { // Сначала ждём регистрацию слушате….
  void (async () => {
    // Сохраняем пояснение разработчика: // Сначала ждём регистрацию слушателя, иначе первые стадии
    // Сначала ждём регистрацию слушателя, иначе первые стадии
    // Сохраняем пояснение разработчика: // распаковки проходят до того, как WebView начнёт их получа…
    // распаковки проходят до того, как WebView начнёт их получать.
    // Ожидаем завершение асинхронной операции await bindLifecycle().
    await bindLifecycle();
    // Обрабатываем конструкцию: void runInit().
    void runInit();
    // Обрабатываем конструкцию: void runVersion().
    void runVersion();
    // Закрываем текущий блок.
  })();
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useResourceInit(): UseResourceInitResult {
  // Обрабатываем конструкцию: const [snapshot, setSnapshot] = useState<ResourceInitSt….
  const [snapshot, setSnapshot] = useState<ResourceInitState>(state);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: ensureStarted.
    ensureStarted();
    // — разделитель логических блоков —

    // Возвращаем результат: subscribe(setSnapshot).
    return subscribe(setSnapshot);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const checkIntegrity = async (): Promise<IntegrityRepor….
  const checkIntegrity = async (): Promise<IntegrityReport | null> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const integrity = await commands.checkIntegrity().
      const integrity = await commands.checkIntegrity();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setState.
      setState({ integrity });
      // — разделитель логических блоков —

      // Возвращаем результат: integrity.
      return integrity;
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setState.
      setState({ error: toErrorMessage(caught) });
      // — разделитель логических блоков —

      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: { ...snapshot, checkIntegrity }.
  return { ...snapshot, checkIntegrity };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
