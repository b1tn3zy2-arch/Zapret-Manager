// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// Импортируем зависимости из модуля zustand/middleware.
import { persist } from "zustand/middleware";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/types.
import type { XrayStatus } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface VpnCoreStoreState {
  // Обрабатываем конструкцию: activeServerId.
  activeServerId: string | null;
  // Сохраняем пояснение разработчика: Название активного сервера: в списке его нет, а подписать ег…
  /** Название активного сервера: в списке его нет, а подписать его надо. */
  // Обрабатываем конструкцию: activeServerName.
  activeServerName: string | null;
  // Обрабатываем конструкцию: status.
  status: XrayStatus | null;
  // Обрабатываем конструкцию: isLoading.
  isLoading: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: setActiveServer.
  setActiveServer: (id: string | null, name?: string | null) => void;
  // Обрабатываем конструкцию: setStatus.
  setStatus: (status: XrayStatus | null) => void;
  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Счётчик запросов на умное подключение. Растёт, когда
   * Счётчик запросов на умное подключение. Растёт, когда
   // Сохраняем пояснение разработчика: * кто-то просит включить VPN: кнопка в игре, трей,
   * кто-то просит включить VPN: кнопка в игре, трей,
   // Сохраняем пояснение разработчика: * автоподключение. Блок подключения следит за ним и
   * автоподключение. Блок подключения следит за ним и
   // Сохраняем пояснение разработчика: * начинает подключение.
   * начинает подключение.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: autoConnectRequest.
  autoConnectRequest: number;
  // Обрабатываем конструкцию: requestAutoConnect.
  requestAutoConnect: () => void;
  // Сохраняем пояснение разработчика: Сбрасывает счётчик: запрос обработан.
  /** Сбрасывает счётчик: запрос обработан. */
  // Обрабатываем конструкцию: consumeAutoConnectRequest.
  consumeAutoConnectRequest: () => void;
  // Обрабатываем конструкцию: setLoading.
  setLoading: (value: boolean) => void;
  // Обрабатываем конструкцию: setError.
  setError: (value: string | null) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс PersistedVpnCoreState с контрактом данных.
interface PersistedVpnCoreState {
  // Обрабатываем конструкцию: activeServerId.
  activeServerId: string | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Списки серверов приложение больше не хранит: подписка одна…
 * Списки серверов приложение больше не хранит: подписка одна и
 // Сохраняем пояснение разработчика: * заданная, а список всегда скачивается заново при подключен…
 * заданная, а список всегда скачивается заново при подключении.
 // Сохраняем пояснение разработчика: * Сохранённые прошлой сборкой серверы выбрасываются, чтобы о…
 * Сохранённые прошлой сборкой серверы выбрасываются, чтобы они не
 // Сохраняем пояснение разработчика: * всплыли в интерфейсе.
 * всплыли в интерфейсе.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function migratePersistedState(
  // Обрабатываем конструкцию: persisted.
  persisted: Partial<PersistedVpnCoreState> | undefined
  // Закрываем выражение или список аргументов.
): PersistedVpnCoreState | undefined {
  // Проверяем бизнес-условие: persisted === undefined.
  if (persisted === undefined) {
    // Возвращаем результат: undefined.
    return undefined;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: { activeServerId: persisted.activeServerId ?? null, }.
  return {
    // Обрабатываем конструкцию: activeServerId.
    activeServerId: persisted.activeServerId ?? null,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useVpnCoreStore = create<VpnCoreStoreState>()(
  // Обрабатываем конструкцию: persist.
  persist(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (set) => ({
      // Обрабатываем конструкцию: activeServerId.
      activeServerId: null,
      // Обрабатываем конструкцию: activeServerName.
      activeServerName: null,
      // Обрабатываем конструкцию: status.
      status: null,
      // Обрабатываем конструкцию: isLoading.
      isLoading: false,
      // Обрабатываем конструкцию: error.
      error: null,
      // Обрабатываем конструкцию: setActiveServer.
      setActiveServer: (id, name) =>
        // Обрабатываем конструкцию: set.
        set({
          // Обрабатываем конструкцию: activeServerId.
          activeServerId: id,
          // Обрабатываем конструкцию: activeServerName.
          activeServerName: id === null ? null : (name ?? null),
          // Закрываем текущий блок.
        }),
      // Обрабатываем конструкцию: setStatus.
      setStatus: (status) => set({ status }),
      // Обрабатываем конструкцию: autoConnectRequest.
      autoConnectRequest: 0,
      // Обрабатываем конструкцию: requestAutoConnect.
      requestAutoConnect: () =>
        // Обрабатываем конструкцию: set.
        set((state) => ({ autoConnectRequest: state.autoConnectRequest + 1 })),
      // Обрабатываем конструкцию: consumeAutoConnectRequest.
      consumeAutoConnectRequest: () => set({ autoConnectRequest: 0 }),
      // Обрабатываем конструкцию: setLoading.
      setLoading: (value) => set({ isLoading: value }),
      // Обрабатываем конструкцию: setError.
      setError: (value) => set({ error: value }),
      // Закрываем текущий блок.
    }),
    // Открываем объектный литерал.
    {
      // Обрабатываем конструкцию: name.
      name: "zapret-manager:vpn-core",
      // Обрабатываем конструкцию: version.
      version: 3,
      // Обрабатываем конструкцию: partialize.
      partialize: (state) => ({
        // Обрабатываем конструкцию: activeServerId.
        activeServerId: state.activeServerId,
        // Закрываем текущий блок.
      }),
      // Сохраняем пояснение разработчика:
      /**
       // Сохраняем пояснение разработчика: * Списки серверов, сохранённые прошлой сборкой, больше не
       * Списки серверов, сохранённые прошлой сборкой, больше не
       // Сохраняем пояснение разработчика: * нужны: подписка всегда скачивается заново.
       * нужны: подписка всегда скачивается заново.
       // Сохраняем пояснение разработчика: 
       */
      // Обрабатываем конструкцию: migrate.
      migrate: (persisted) =>
        // Обрабатываем конструкцию: migratePersistedState.
        migratePersistedState(
          // Обрабатываем конструкцию: persisted.
          persisted as Partial<PersistedVpnCoreState> | undefined
          // Закрываем выражение или список аргументов.
        ),
      // Закрываем текущий блок.
    }
    // Закрываем выражение или список аргументов.
  )
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —
