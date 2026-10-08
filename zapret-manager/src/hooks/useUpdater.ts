import { useUpdateActions } from "@/hooks/useUpdateActions";
import { useUpdateLibrary } from "@/hooks/useUpdateLibrary";
import {
  useUpdateModalControls,
  useUpdateProgressListener,
} from "@/hooks/useUpdateProgress";
import type { UpdateBackupInfo } from "@/types";

export interface UseUpdaterResult {
  check: () => Promise<void>;
  download: () => Promise<void>;
  install: () => Promise<void>;
  cancel: () => Promise<void>;
  rollback: (backupPath: string) => Promise<void>;
  loadBackups: () => Promise<UpdateBackupInfo[]>;
  markCurrentVersion: (version: string) => Promise<void>;
  ignoreVersion: (version: string) => Promise<void>;
  dismiss: () => void;
  openModal: () => void;
  closeModal: () => void;
}

export function useUpdater(): UseUpdaterResult {
  const transfer = useUpdateActions();
  const library = useUpdateLibrary(transfer.check);
  const { dismiss, openModal, closeModal } = useUpdateModalControls();

  useUpdateProgressListener();

  return {
    ...transfer,
    ...library,
    dismiss,
    openModal,
    closeModal,
  };
}
