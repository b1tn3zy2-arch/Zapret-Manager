// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// Импортируем зависимости из модуля zustand/middleware.
import { persist } from "zustand/middleware";
// Импортируем зависимости из модуля zustand/middleware/immer.
import { immer } from "zustand/middleware/immer";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/types.
import type { SwitchStep, VpnConfigInfo, VpnStatus } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const EMPTY_VPN_STATUS: VpnStatus = { state: disconnect….
const EMPTY_VPN_STATUS: VpnStatus = {
  // Обрабатываем конструкцию: state.
  state: "disconnected",
  // Обрабатываем конструкцию: interface.
  interface: null,
  // Обрабатываем конструкцию: endpoint.
  endpoint: null,
  // Обрабатываем конструкцию: handshakeAt.
  handshakeAt: null,
  // Обрабатываем конструкцию: bytesIn.
  bytesIn: null,
  // Обрабатываем конструкцию: bytesOut.
  bytesOut: null,
  // Обрабатываем конструкцию: uptimeSec.
  uptimeSec: null,
  // Обрабатываем конструкцию: error.
  error: null,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface VpnStoreState {
  // Обрабатываем конструкцию: configs.
  configs: VpnConfigInfo[];
  // Обрабатываем конструкцию: activeConfigId.
  activeConfigId: string | null;
  // Обрабатываем конструкцию: status.
  status: VpnStatus;
  // Обрабатываем конструкцию: isSwitching.
  isSwitching: boolean;
  // Обрабатываем конструкцию: switchStep.
  switchStep: SwitchStep | null;
  // Обрабатываем конструкцию: wireguardInstalled.
  wireguardInstalled: boolean;
  // Обрабатываем конструкцию: killSwitchActive.
  killSwitchActive: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: setConfigs.
  setConfigs: (configs: VpnConfigInfo[]) => void;
  // Обрабатываем конструкцию: addConfig.
  addConfig: (config: VpnConfigInfo) => void;
  // Обрабатываем конструкцию: removeConfig.
  removeConfig: (id: string) => void;
  // Обрабатываем конструкцию: setActiveConfig.
  setActiveConfig: (id: string | null) => void;
  // Обрабатываем конструкцию: setStatus.
  setStatus: (status: Partial<VpnStatus>) => void;
  // Обрабатываем конструкцию: setSwitching.
  setSwitching: (value: boolean) => void;
  // Обрабатываем конструкцию: setSwitchStep.
  setSwitchStep: (step: SwitchStep | null) => void;
  // Обрабатываем конструкцию: setWireguardInstalled.
  setWireguardInstalled: (value: boolean) => void;
  // Обрабатываем конструкцию: setKillSwitchActive.
  setKillSwitchActive: (value: boolean) => void;
  // Обрабатываем конструкцию: setError.
  setError: (value: string | null) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useVpnStore = create<VpnStoreState>()(
  // Обрабатываем конструкцию: persist.
  persist(
    // Обрабатываем конструкцию: immer.
    immer((set) => ({
      // Обрабатываем конструкцию: configs.
      configs: [],
      // Обрабатываем конструкцию: activeConfigId.
      activeConfigId: null,
      // Обрабатываем конструкцию: status.
      status: { ...EMPTY_VPN_STATUS },
      // Обрабатываем конструкцию: isSwitching.
      isSwitching: false,
      // Обрабатываем конструкцию: switchStep.
      switchStep: null,
      // Обрабатываем конструкцию: wireguardInstalled.
      wireguardInstalled: false,
      // Обрабатываем конструкцию: killSwitchActive.
      killSwitchActive: false,
      // Обрабатываем конструкцию: error.
      error: null,
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setConfigs.
      setConfigs: (configs) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.configs = configs;
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addConfig.
      addConfig: (config) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.configs = [
            // Разворачиваем ...state.configs.filter((item) => item.id !==… в коллекцию.
            ...state.configs.filter((item) => item.id !== config.id),
            // Обрабатываем конструкцию: config.
            config,
            // Закрываем массив или список.
          ];
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: removeConfig.
      removeConfig: (id) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.configs = state.configs.filter((item) => item.id !== id);
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: state.activeConfigId === id.
          if (state.activeConfigId === id) {
            // Обрабатываем конструкцию: state.
            state.activeConfigId = null;
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setActiveConfig.
      setActiveConfig: (id) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.activeConfigId = id;
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setStatus.
      setStatus: (status) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: Object.
          Object.assign(state.status, status);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setSwitching.
      setSwitching: (value) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.isSwitching = value;
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: !value.
          if (!value) {
            // Обрабатываем конструкцию: state.
            state.switchStep = null;
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setSwitchStep.
      setSwitchStep: (step) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.switchStep = step;
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setWireguardInstalled.
      setWireguardInstalled: (value) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.wireguardInstalled = value;
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setKillSwitchActive.
      setKillSwitchActive: (value) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.killSwitchActive = value;
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setError.
      setError: (value) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.error = value;
          // Закрываем текущий блок.
        }),
      // Закрываем текущий блок.
    })),
    // Открываем объектный литерал.
    {
      // Обрабатываем конструкцию: name.
      name: "zapret-manager:vpn",
      // Обрабатываем конструкцию: partialize.
      partialize: (state) => ({
        // Обрабатываем конструкцию: configs.
        configs: state.configs,
        // Обрабатываем конструкцию: activeConfigId.
        activeConfigId: state.activeConfigId,
        // Закрываем текущий блок.
      }),
      // Закрываем текущий блок.
    }
    // Закрываем выражение или список аргументов.
  )
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectVpnConfigs = (state: VpnStoreState): VpnConfigInfo[] =>
  // Обрабатываем конструкцию: state.
  state.configs;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectVpnActive = (state: VpnStoreState): boolean =>
  // Обрабатываем конструкцию: state.
  state.status.state === "connected";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectVpnSwitching = (state: VpnStoreState): boolean =>
  // Обрабатываем конструкцию: state.
  state.isSwitching;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectActiveConfig = (
  // Обрабатываем конструкцию: state.
  state: VpnStoreState
  // Закрываем выражение или список аргументов.
): VpnConfigInfo | null =>
  // Обрабатываем конструкцию: state.
  state.configs.find((config) => config.id === state.activeConfigId) ?? null;
// — разделитель логических блоков —
