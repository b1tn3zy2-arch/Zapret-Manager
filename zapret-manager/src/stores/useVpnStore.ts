import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { SwitchStep, VpnConfigInfo, VpnStatus } from "@/types";

const EMPTY_VPN_STATUS: VpnStatus = {
  state: "disconnected",
  interface: null,
  endpoint: null,
  handshakeAt: null,
  bytesIn: null,
  bytesOut: null,
  uptimeSec: null,
  error: null,
};

export interface VpnStoreState {
  configs: VpnConfigInfo[];
  activeConfigId: string | null;
  status: VpnStatus;
  isSwitching: boolean;
  switchStep: SwitchStep | null;
  wireguardInstalled: boolean;
  killSwitchActive: boolean;
  error: string | null;
  setConfigs: (configs: VpnConfigInfo[]) => void;
  addConfig: (config: VpnConfigInfo) => void;
  removeConfig: (id: string) => void;
  setActiveConfig: (id: string | null) => void;
  setStatus: (status: Partial<VpnStatus>) => void;
  setSwitching: (value: boolean) => void;
  setSwitchStep: (step: SwitchStep | null) => void;
  setWireguardInstalled: (value: boolean) => void;
  setKillSwitchActive: (value: boolean) => void;
  setError: (value: string | null) => void;
}

export const useVpnStore = create<VpnStoreState>()(
  persist(
    immer((set) => ({
      configs: [],
      activeConfigId: null,
      status: { ...EMPTY_VPN_STATUS },
      isSwitching: false,
      switchStep: null,
      wireguardInstalled: false,
      killSwitchActive: false,
      error: null,

      setConfigs: (configs) =>
        set((state) => {
          state.configs = configs;
        }),

      addConfig: (config) =>
        set((state) => {
          state.configs = [
            ...state.configs.filter((item) => item.id !== config.id),
            config,
          ];
        }),

      removeConfig: (id) =>
        set((state) => {
          state.configs = state.configs.filter((item) => item.id !== id);

          if (state.activeConfigId === id) {
            state.activeConfigId = null;
          }
        }),

      setActiveConfig: (id) =>
        set((state) => {
          state.activeConfigId = id;
        }),

      setStatus: (status) =>
        set((state) => {
          Object.assign(state.status, status);
        }),

      setSwitching: (value) =>
        set((state) => {
          state.isSwitching = value;

          if (!value) {
            state.switchStep = null;
          }
        }),

      setSwitchStep: (step) =>
        set((state) => {
          state.switchStep = step;
        }),

      setWireguardInstalled: (value) =>
        set((state) => {
          state.wireguardInstalled = value;
        }),

      setKillSwitchActive: (value) =>
        set((state) => {
          state.killSwitchActive = value;
        }),

      setError: (value) =>
        set((state) => {
          state.error = value;
        }),
    })),
    {
      name: "zapret-manager:vpn",
      partialize: (state) => ({
        configs: state.configs,
        activeConfigId: state.activeConfigId,
      }),
    }
  )
);

export const selectVpnConfigs = (state: VpnStoreState): VpnConfigInfo[] =>
  state.configs;

export const selectVpnActive = (state: VpnStoreState): boolean =>
  state.status.state === "connected";

export const selectVpnSwitching = (state: VpnStoreState): boolean =>
  state.isSwitching;

export const selectActiveConfig = (
  state: VpnStoreState
): VpnConfigInfo | null =>
  state.configs.find((config) => config.id === state.activeConfigId) ?? null;
