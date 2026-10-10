import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SubscriptionServer, XrayStatus } from "@/types";

export interface VpnCoreStoreState {
  subscriptionUrl: string;
  servers: SubscriptionServer[];
  activeServerId: string | null;
  status: XrayStatus | null;
  isLoading: boolean;
  error: string | null;
  setSubscriptionUrl: (url: string) => void;
  setServers: (servers: SubscriptionServer[]) => void;
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
      activeServerId: null,
      status: null,
      isLoading: false,
      error: null,
      setSubscriptionUrl: (url) => set({ subscriptionUrl: url }),
      setServers: (servers) => set({ servers }),
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
        activeServerId: state.activeServerId,
      }),
    }
  )
);
