import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SubscriptionServer, XrayStatus } from "@/types";

export interface VpnCoreStoreState {
  subscriptionUrl: string;
  servers: SubscriptionServer[];
  /**
   * Идентификаторы серверов, удалённых пользователем.
   *
   * Подписка отдаёт полный список, поэтому простое удаление из массива
   * возвращало сервер уже при следующем обновлении: пользователь ничего не
   * мог удалить. Скрытые идентификаторы переживают обновление подписки.
   */
  hiddenServerIds: string[];
  activeServerId: string | null;
  status: XrayStatus | null;
  isLoading: boolean;
  error: string | null;
  setSubscriptionUrl: (url: string) => void;
  clearSubscription: () => void;
  setServers: (servers: SubscriptionServer[]) => void;
  /** Добавляет серверы к текущим, не затирая уже загруженные. */
  addServers: (servers: SubscriptionServer[]) => void;
  removeServer: (id: string) => void;
  setActiveServer: (id: string | null) => void;
  setStatus: (status: XrayStatus | null) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
}

interface PersistedVpnCoreState {
  subscriptionUrl: string;
  servers: SubscriptionServer[];
  hiddenServerIds: string[];
  activeServerId: string | null;
}

/**
 * Списки, сохранённые прошлой сборкой, не содержат полей транспорта и
 * шифрования: их добавили вместе с тегами в строке сервера. Такие записи
 * выбрасываются, иначе список ломал интерфейс при переходе в режим VPN.
 */
export function migratePersistedState(
  persisted: Partial<PersistedVpnCoreState> | undefined
): PersistedVpnCoreState | undefined {
  if (persisted === undefined || persisted.servers === undefined) {
    return persisted as PersistedVpnCoreState | undefined;
  }

  const servers = (persisted.servers ?? []).filter(
    (server) =>
      typeof server?.transport === "string" &&
      typeof server?.security === "string"
  );
  const activeServerId = servers.some(
    (server) => server.id === persisted.activeServerId
  )
    ? (persisted.activeServerId ?? null)
    : null;

  return {
    subscriptionUrl: persisted.subscriptionUrl ?? "",
    servers,
    activeServerId,
    hiddenServerIds: (persisted.hiddenServerIds ?? []).filter((id) =>
      servers.some((server) => server.id === id)
    ),
  };
}

export const useVpnCoreStore = create<VpnCoreStoreState>()(
  persist(
    (set) => ({
      subscriptionUrl: "",
      servers: [],
      hiddenServerIds: [],
      activeServerId: null,
      status: null,
      isLoading: false,
      error: null,
      setSubscriptionUrl: (url) => set({ subscriptionUrl: url }),
      clearSubscription: () =>
        set({
          subscriptionUrl: "",
          servers: [],
          hiddenServerIds: [],
          activeServerId: null,
        }),
      setServers: (servers) =>
        set((state) => ({
          // удалённые серверы не возвращаются после обновления подписки
          servers: servers.filter(
            (server) => !state.hiddenServerIds.includes(server.id)
          ),
          activeServerId:
            state.activeServerId !== null &&
            servers.some((server) => server.id === state.activeServerId)
              ? state.activeServerId
              : null,
        })),
      addServers: (incoming) =>
        set((state) => {
          const known = new Set(state.servers.map((server) => server.id));
          const added = incoming.filter(
            (server) =>
              !known.has(server.id) &&
              !state.hiddenServerIds.includes(server.id)
          );

          if (added.length === 0) {
            return state;
          }

          const servers = [...state.servers, ...added];

          return { servers };
        }),
      removeServer: (id) =>
        set((state) => ({
          hiddenServerIds: state.hiddenServerIds.includes(id)
            ? state.hiddenServerIds
            : [...state.hiddenServerIds, id],
          servers: state.servers.filter((server) => server.id !== id),
          activeServerId:
            state.activeServerId === id ? null : state.activeServerId,
        })),
      setActiveServer: (id) => set({ activeServerId: id }),
      setStatus: (status) => set({ status }),
      setLoading: (value) => set({ isLoading: value }),
      setError: (value) => set({ error: value }),
    }),
    {
      name: "zapret-manager:vpn-core",
      version: 2,
      partialize: (state) => ({
        subscriptionUrl: state.subscriptionUrl,
        servers: state.servers,
        hiddenServerIds: state.hiddenServerIds,
        activeServerId: state.activeServerId,
      }),
      /**
       * Списки, сохранённые прошлой сборкой, не содержат полей транспорта и
       * шифрования: их добавили вместе с тегами в строке сервера. Такие записи
       * выбрасываются, чтобы список не ломал интерфейс и обновился из подписки
       * целиком.
       */
      migrate: (persisted) =>
        migratePersistedState(
          persisted as Partial<PersistedVpnCoreState> | undefined
        ),
    }
  )
);
