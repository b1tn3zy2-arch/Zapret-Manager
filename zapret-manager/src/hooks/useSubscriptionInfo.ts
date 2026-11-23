// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/vpnCommands.
import {
  // Обрабатываем конструкцию: addSubscription.
  addSubscription as addSubscriptionCommand,
  // Подключаем именованный импорт fetchTariffMatrix.
  fetchTariffMatrix,
  // Подключаем именованный импорт getSubscription.
  getSubscription,
  // Подключаем именованный импорт prepareSubscriptionServers.
  prepareSubscriptionServers,
  // Обрабатываем конструкцию: refreshSubscription.
  refreshSubscription as refreshSubscriptionCommand,
  // Обрабатываем конструкцию: removeSubscription.
  removeSubscription as removeSubscriptionCommand,
  // Закрываем текущий блок.
} from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { SubscriptionInfo, TariffMatrix } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseSubscriptionInfoResult {
  // Обрабатываем конструкцию: info.
  info: SubscriptionInfo | null;
  // Обрабатываем конструкцию: matrix.
  matrix: TariffMatrix | null;
  // Обрабатываем конструкцию: isLoading.
  isLoading: boolean;
  // Обрабатываем конструкцию: isSaving.
  isSaving: boolean;
  // Обрабатываем конструкцию: isRefreshing.
  isRefreshing: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: reload.
  reload: () => Promise<void>;
  // Обрабатываем конструкцию: add.
  add: (url: string) => Promise<boolean>;
  // Обрабатываем конструкцию: remove.
  remove: () => Promise<void>;
  // Обрабатываем конструкцию: refresh.
  refresh: () => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Состояние подписки и тарифы.
 * Состояние подписки и тарифы.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * getSubscription читает только сохранённый снимок: карточка…
 * `getSubscription` читает только сохранённый снимок: карточка не
 // Сохраняем пояснение разработчика: * ждёт сеть. Свежие данные приходят командой refresh_subscri…
 * ждёт сеть. Свежие данные приходят командой `refresh_subscription`,
 // Сохраняем пояснение разработчика: * её же вызываем после оплаты.
 * её же вызываем после оплаты.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function useSubscriptionInfo(): UseSubscriptionInfoResult {
  // Обрабатываем конструкцию: const [info, setInfo] = useState<SubscriptionInfo | nul….
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  // Обрабатываем конструкцию: const [matrix, setMatrix] = useState<TariffMatrix | nul….
  const [matrix, setMatrix] = useState<TariffMatrix | null>(null);
  // Обрабатываем конструкцию: const [isLoading, setIsLoading] = useState(true).
  const [isLoading, setIsLoading] = useState(true);
  // Обрабатываем конструкцию: const [isSaving, setIsSaving] = useState(false).
  const [isSaving, setIsSaving] = useState(false);
  // Обрабатываем конструкцию: const [isRefreshing, setIsRefreshing] = useState(false).
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const load = useCallback(async (): Promise<void> => { t….
  const load = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const [subscription, tariffs] = await Promise.all([ get….
      const [subscription, tariffs] = await Promise.all([
        // Обрабатываем конструкцию: getSubscription.
        getSubscription(),
        // Обрабатываем конструкцию: fetchTariffMatrix.
        fetchTariffMatrix(),
        // Закрываем массив или список.
      ]);
      // Обрабатываем конструкцию: setInfo.
      setInfo(subscription);
      // Обрабатываем конструкцию: setMatrix.
      setMatrix(tariffs);
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setError.
      setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setIsLoading.
      setIsLoading(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const reload = useCallback(async (): Promise<void> => {….
  const reload = useCallback(async (): Promise<void> => {
    // Обрабатываем конструкцию: setIsLoading.
    setIsLoading(true);
    // Ожидаем завершение асинхронной операции await load().
    await load();
    // Закрываем текущий блок.
  }, [load]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const add = useCallback(async (url: string): Promise<bo….
  const add = useCallback(async (url: string): Promise<boolean> => {
    // Обрабатываем конструкцию: setIsSaving.
    setIsSaving(true);
    // Обрабатываем конструкцию: setError.
    setError(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Сохраняем пояснение разработчика: // Ссылку сохраняет backend: без этого вызова ничего бы не
      // Ссылку сохраняет backend: без этого вызова ничего бы не
      // Сохраняем пояснение разработчика: // записалось. Результат не нужен — свежий снимок приходит и…
      // записалось. Результат не нужен — свежий снимок приходит из
      // Сохраняем пояснение разработчика: // refresh_subscription ниже.
      // refresh_subscription ниже.
      // Ожидаем завершение асинхронной операции await addSubscriptionCommand(url).
      await addSubscriptionCommand(url);
      // Сохраняем пояснение разработчика: // Список серверов подтягивается сам: кнопка VPN становится
      // Список серверов подтягивается сам: кнопка VPN становится
      // Сохраняем пояснение разработчика: // доступной сразу после подтверждения подписки.
      // доступной сразу после подтверждения подписки.
      // Обрабатываем конструкцию: const [prepared, refreshed] = await Promise.allSettled(….
      const [prepared, refreshed] = await Promise.allSettled([
        // Обрабатываем конструкцию: prepareSubscriptionServers.
        prepareSubscriptionServers(),
        // Обрабатываем конструкцию: refreshSubscriptionCommand.
        refreshSubscriptionCommand(),
        // Закрываем массив или список.
      ]);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: refreshed.status === fulfilled.
      if (refreshed.status === "fulfilled") {
        // Обрабатываем конструкцию: setInfo.
        setInfo(refreshed.value);
        // Закрываем текущий блок.
      } else if (prepared.status === "rejected") {
        // Обрабатываем конструкцию: setError.
        setError(toErrorMessage(prepared.reason));
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Возвращаем результат: true.
      return true;
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setError.
      setError(toErrorMessage(caught));
      // — разделитель логических блоков —

      // Возвращаем результат: false.
      return false;
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setIsSaving.
      setIsSaving(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const remove = useCallback(async (): Promise<void> => {….
  const remove = useCallback(async (): Promise<void> => {
    // Обрабатываем конструкцию: setIsSaving.
    setIsSaving(true);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await removeSubscriptionCommand().
      await removeSubscriptionCommand();
      // Обрабатываем конструкцию: setInfo.
      setInfo({
        // Обрабатываем конструкцию: trafficUsedGb.
        trafficUsedGb: null,
        // Обрабатываем конструкцию: trafficLimitGb.
        trafficLimitGb: null,
        // Обрабатываем конструкцию: trafficPercent.
        trafficPercent: null,
        // Обрабатываем конструкцию: daysRemaining.
        daysRemaining: null,
        // Обрабатываем конструкцию: isActive.
        isActive: false,
        // Обрабатываем конструкцию: isLinked.
        isLinked: false,
        // Обрабатываем конструкцию: title.
        title: null,
        // Обрабатываем конструкцию: serverCount.
        serverCount: null,
        // Обрабатываем конструкцию: expiresAt.
        expiresAt: null,
        // Обрабатываем конструкцию: lastCheckedAt.
        lastCheckedAt: null,
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setError.
      setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setIsSaving.
      setIsSaving(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const refresh = useCallback(async (): Promise<void> => ….
  const refresh = useCallback(async (): Promise<void> => {
    // Проверяем бизнес-условие: isRefreshing.
    if (isRefreshing) return;
    // Обрабатываем конструкцию: setIsRefreshing.
    setIsRefreshing(true);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: setInfo.
      setInfo(await refreshSubscriptionCommand());
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setError.
      setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setIsRefreshing.
      setIsRefreshing(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [isRefreshing]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Сохраняем пояснение разработчика: // Через микротаску: загрузка обновляет состояние, а вызов
    // Через микротаску: загрузка обновляет состояние, а вызов
    // Сохраняем пояснение разработчика: // напрямую в теле эффекта ломает правило react-hooks/set-st…
    // напрямую в теле эффекта ломает правило react-hooks/set-state-in-effect.
    // Обрабатываем конструкцию: queueMicrotask.
    queueMicrotask(() => {
      // Обрабатываем конструкцию: void load().
      void load();
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }, [load]);
  // — разделитель логических блоков —

  // Возвращаем результат: { info, matrix, isLoading, isSaving, isRefreshing, erro….
  return {
    // Передаём поле info в объект.
    info,
    // Передаём поле matrix в объект.
    matrix,
    // Передаём поле isLoading в объект.
    isLoading,
    // Передаём поле isSaving в объект.
    isSaving,
    // Передаём поле isRefreshing в объект.
    isRefreshing,
    // Передаём поле error в объект.
    error,
    // Передаём поле reload в объект.
    reload,
    // Передаём поле add в объект.
    add,
    // Передаём поле remove в объект.
    remove,
    // Передаём поле refresh в объект.
    refresh,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
