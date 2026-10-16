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
  removeServer: (id: string) => void;
  setActiveServer: (id: string | null) => void;
  setStatus: (status: XrayStatus | null) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
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
      partialize: (state) => ({
        subscriptionUrl: state.subscriptionUrl,
        servers: state.servers,
        hiddenServerIds: state.hiddenServerIds,
        activeServerId: state.activeServerId,
      }),
    }
  )
);
