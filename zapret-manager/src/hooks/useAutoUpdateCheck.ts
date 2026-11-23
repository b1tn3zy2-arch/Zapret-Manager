// Импортируем зависимости из модуля react.
import { useEffect } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useUpdater.
import { useUpdater } from "@/hooks/useUpdater";
// Импортируем зависимости из модуля @/lib/constants.
import { UPDATE_CHECK_DELAY_MS } from "@/lib/constants";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const HOUR_MS = 60 * 60 * 1000.
const HOUR_MS = 60 * 60 * 1000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useAutoUpdateCheck(): void {
  // Обрабатываем конструкцию: const check = useUpdater().check.
  const check = useUpdater().check;
  // Обрабатываем конструкцию: const autoCheck = useSettingsStore( (state) => state.se….
  const autoCheck = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.strategyUpdates.autoCheck
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const checkIntervalHours = useSettingsStore( (state) =>….
  const checkIntervalHours = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.strategyUpdates.checkIntervalHours
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: !autoCheck.
    if (!autoCheck) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: let timer = 0.
    let timer = 0;
    // Обрабатываем конструкцию: let cancelled = false.
    let cancelled = false;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const schedule = (): void => { if (cancelled) { return;….
    const schedule = (): void => {
      // Проверяем бизнес-условие: cancelled.
      if (cancelled) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const store = useSettingsStore.getState().
      const store = useSettingsStore.getState();
      // Обрабатываем конструкцию: const { settings } = store.
      const { settings } = store;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !store.loaded || settings.strategiesFolder ===.
      if (!store.loaded || settings.strategiesFolder === "") {
        // Обрабатываем конструкцию: timer.
        timer = window.setTimeout(schedule, UPDATE_CHECK_DELAY_MS);
        // — разделитель логических блоков —

        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: void check().
      void check();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: timer.
      timer = window.setTimeout(schedule, checkIntervalHours * HOUR_MS);
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: schedule.
    schedule();
    // — разделитель логических блоков —

    // Возвращаем результат: () => { cancelled = true; window.clearTimeout(timer); }.
    return () => {
      // Обрабатываем конструкцию: cancelled.
      cancelled = true;
      // Обрабатываем конструкцию: window.
      window.clearTimeout(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [autoCheck, check, checkIntervalHours]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
