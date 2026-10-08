import { useCallback, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

import { useUpdateStore } from "@/stores/useUpdateStore";
import type { DownloadProgress } from "@/types";

const EVENT_PROGRESS = "update-download-progress";

export function useUpdateProgressListener(): void {
  useEffect(() => {
    const subscription = listen<DownloadProgress>(EVENT_PROGRESS, (event) => {
      useUpdateStore.getState().setProgress(event.payload);
    });

    return () => {
      void subscription.then((unlisten) => {
        unlisten();
      });
    };
  }, []);
}

export function useUpdateModalControls(): {
  dismiss: () => void;
  openModal: () => void;
  closeModal: () => void;
} {
  const dismiss = useCallback(() => {
    useUpdateStore.getState().dismiss();
  }, []);

  const openModal = useCallback(() => {
    useUpdateStore.getState().openModal();
  }, []);

  const closeModal = useCallback(() => {
    useUpdateStore.getState().closeModal();
  }, []);

  return { dismiss, openModal, closeModal };
}
