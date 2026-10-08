import { create } from "zustand";

import type {
  DownloadProgress,
  InstallReport,
  UpdateInfo,
  UpdateStatus,
} from "@/types";

export interface UpdateStoreState {
  status: UpdateStatus;
  info: UpdateInfo | null;
  progress: DownloadProgress | null;
  error: string | null;
  report: InstallReport | null;
  isModalOpen: boolean;
  isDismissed: boolean;
  archivePath: string | null;
  setStatus: (status: UpdateStatus) => void;
  setInfo: (info: UpdateInfo | null) => void;
  setProgress: (progress: DownloadProgress | null) => void;
  setError: (error: string | null) => void;
  setReport: (report: InstallReport | null) => void;
  setArchive: (path: string | null) => void;
  openModal: () => void;
  closeModal: () => void;
  dismiss: () => void;
  reset: () => void;
}

export const useUpdateStore = create<UpdateStoreState>()((set) => ({
  status: "idle",
  info: null,
  progress: null,
  error: null,
  report: null,
  isModalOpen: false,
  isDismissed: false,
  archivePath: null,

  setStatus: (status) =>
    set((state) => ({
      status,
      isModalOpen:
        state.isModalOpen || (status === "available" && !state.isDismissed),
      error: status === "error" ? state.error : null,
    })),
  setInfo: (info) => set({ info }),
  setProgress: (progress) => set({ progress }),
  setError: (error) =>
    set((state) => ({
      error,
      status: error === null ? state.status : "error",
    })),
  setReport: (report) => set({ report }),
  setArchive: (path) => set({ archivePath: path }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  dismiss: () => set({ isDismissed: true, isModalOpen: false }),
  reset: () =>
    set({
      status: "idle",
      info: null,
      progress: null,
      error: null,
      report: null,
      isModalOpen: false,
      isDismissed: false,
      archivePath: null,
    }),
}));
