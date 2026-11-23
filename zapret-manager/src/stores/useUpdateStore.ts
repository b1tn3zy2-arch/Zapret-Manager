// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/types.
import type {
  // Подключаем именованный импорт DownloadProgress.
  DownloadProgress,
  // Подключаем именованный импорт InstallReport.
  InstallReport,
  // Подключаем именованный импорт UpdateInfo.
  UpdateInfo,
  // Подключаем именованный импорт UpdateStatus.
  UpdateStatus,
  // Закрываем текущий блок.
} from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UpdateStoreState {
  // Обрабатываем конструкцию: status.
  status: UpdateStatus;
  // Обрабатываем конструкцию: info.
  info: UpdateInfo | null;
  // Обрабатываем конструкцию: progress.
  progress: DownloadProgress | null;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: report.
  report: InstallReport | null;
  // Обрабатываем конструкцию: isModalOpen.
  isModalOpen: boolean;
  // Обрабатываем конструкцию: isDismissed.
  isDismissed: boolean;
  // Обрабатываем конструкцию: archivePath.
  archivePath: string | null;
  // Обрабатываем конструкцию: setStatus.
  setStatus: (status: UpdateStatus) => void;
  // Обрабатываем конструкцию: setInfo.
  setInfo: (info: UpdateInfo | null) => void;
  // Обрабатываем конструкцию: setProgress.
  setProgress: (progress: DownloadProgress | null) => void;
  // Обрабатываем конструкцию: setError.
  setError: (error: string | null) => void;
  // Обрабатываем конструкцию: setReport.
  setReport: (report: InstallReport | null) => void;
  // Обрабатываем конструкцию: setArchive.
  setArchive: (path: string | null) => void;
  // Обрабатываем конструкцию: openModal.
  openModal: () => void;
  // Обрабатываем конструкцию: closeModal.
  closeModal: () => void;
  // Обрабатываем конструкцию: dismiss.
  dismiss: () => void;
  // Обрабатываем конструкцию: reset.
  reset: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useUpdateStore = create<UpdateStoreState>()((set) => ({
  // Обрабатываем конструкцию: status.
  status: "idle",
  // Обрабатываем конструкцию: info.
  info: null,
  // Обрабатываем конструкцию: progress.
  progress: null,
  // Обрабатываем конструкцию: error.
  error: null,
  // Обрабатываем конструкцию: report.
  report: null,
  // Обрабатываем конструкцию: isModalOpen.
  isModalOpen: false,
  // Обрабатываем конструкцию: isDismissed.
  isDismissed: false,
  // Обрабатываем конструкцию: archivePath.
  archivePath: null,
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: setStatus.
  setStatus: (status) =>
    // Обрабатываем конструкцию: set.
    set((state) => ({
      // Передаём поле status в объект.
      status,
      // Обрабатываем конструкцию: isModalOpen.
      isModalOpen:
        // Обрабатываем конструкцию: state.
        state.isModalOpen || (status === "available" && !state.isDismissed),
      // Обрабатываем конструкцию: error.
      error: status === "error" ? state.error : null,
      // Закрываем текущий блок.
    })),
  // Обрабатываем конструкцию: setInfo.
  setInfo: (info) => set({ info }),
  // Обрабатываем конструкцию: setProgress.
  setProgress: (progress) => set({ progress }),
  // Обрабатываем конструкцию: setError.
  setError: (error) =>
    // Обрабатываем конструкцию: set.
    set((state) => ({
      // Передаём поле error в объект.
      error,
      // Обрабатываем конструкцию: status.
      status: error === null ? state.status : "error",
      // Закрываем текущий блок.
    })),
  // Обрабатываем конструкцию: setReport.
  setReport: (report) => set({ report }),
  // Обрабатываем конструкцию: setArchive.
  setArchive: (path) => set({ archivePath: path }),
  // Обрабатываем конструкцию: openModal.
  openModal: () => set({ isModalOpen: true }),
  // Обрабатываем конструкцию: closeModal.
  closeModal: () => set({ isModalOpen: false }),
  // Обрабатываем конструкцию: dismiss.
  dismiss: () => set({ isDismissed: true, isModalOpen: false }),
  // Обрабатываем конструкцию: reset.
  reset: () =>
    // Обрабатываем конструкцию: set.
    set({
      // Обрабатываем конструкцию: status.
      status: "idle",
      // Обрабатываем конструкцию: info.
      info: null,
      // Обрабатываем конструкцию: progress.
      progress: null,
      // Обрабатываем конструкцию: error.
      error: null,
      // Обрабатываем конструкцию: report.
      report: null,
      // Обрабатываем конструкцию: isModalOpen.
      isModalOpen: false,
      // Обрабатываем конструкцию: isDismissed.
      isDismissed: false,
      // Обрабатываем конструкцию: archivePath.
      archivePath: null,
      // Закрываем текущий блок.
    }),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —
