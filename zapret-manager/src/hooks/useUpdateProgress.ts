// Импортируем зависимости из модуля react.
import { useCallback, useEffect } from "react";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useUpdateStore.
import { useUpdateStore } from "@/stores/useUpdateStore";
// Импортируем зависимости из модуля @/types.
import type { DownloadProgress } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const EVENT_PROGRESS = update-download-progress.
const EVENT_PROGRESS = "update-download-progress";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useUpdateProgressListener(): void {
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const subscription = listen<DownloadProgress>(EVENT_PRO….
    const subscription = listen<DownloadProgress>(EVENT_PROGRESS, (event) => {
      // Обрабатываем конструкцию: useUpdateStore.
      useUpdateStore.getState().setProgress(event.payload);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { void subscription.then((unlisten) => { unlisten….
    return () => {
      // Обрабатываем конструкцию: void subscription.then((unlisten) => { unlisten(); }).
      void subscription.then((unlisten) => {
        // Обрабатываем конструкцию: unlisten.
        unlisten();
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useUpdateModalControls(): {
  // Обрабатываем конструкцию: dismiss.
  dismiss: () => void;
  // Обрабатываем конструкцию: openModal.
  openModal: () => void;
  // Обрабатываем конструкцию: closeModal.
  closeModal: () => void;
  // Закрываем текущий блок.
} {
  // Обрабатываем конструкцию: const dismiss = useCallback(() => { useUpdateStore.getS….
  const dismiss = useCallback(() => {
    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().dismiss();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const openModal = useCallback(() => { useUpdateStore.ge….
  const openModal = useCallback(() => {
    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().openModal();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const closeModal = useCallback(() => { useUpdateStore.g….
  const closeModal = useCallback(() => {
    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().closeModal();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: { dismiss, openModal, closeModal }.
  return { dismiss, openModal, closeModal };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
