// Импортируем зависимости из модуля @/hooks/useUpdateActions.
import { useUpdateActions } from "@/hooks/useUpdateActions";
// Импортируем зависимости из модуля @/hooks/useUpdateLibrary.
import { useUpdateLibrary } from "@/hooks/useUpdateLibrary";
// Импортируем зависимости из модуля @/hooks/useUpdateProgress.
import {
  // Подключаем именованный импорт useUpdateModalControls.
  useUpdateModalControls,
  // Подключаем именованный импорт useUpdateProgressListener.
  useUpdateProgressListener,
  // Закрываем текущий блок.
} from "@/hooks/useUpdateProgress";
// Импортируем зависимости из модуля @/types.
import type { UpdateBackupInfo } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseUpdaterResult {
  // Обрабатываем конструкцию: check.
  check: () => Promise<void>;
  // Обрабатываем конструкцию: download.
  download: () => Promise<void>;
  // Обрабатываем конструкцию: install.
  install: () => Promise<void>;
  // Обрабатываем конструкцию: cancel.
  cancel: () => Promise<void>;
  // Обрабатываем конструкцию: rollback.
  rollback: (backupPath: string) => Promise<void>;
  // Обрабатываем конструкцию: loadBackups.
  loadBackups: () => Promise<UpdateBackupInfo[]>;
  // Обрабатываем конструкцию: markCurrentVersion.
  markCurrentVersion: (version: string) => Promise<void>;
  // Обрабатываем конструкцию: ignoreVersion.
  ignoreVersion: (version: string) => Promise<void>;
  // Обрабатываем конструкцию: dismiss.
  dismiss: () => void;
  // Обрабатываем конструкцию: openModal.
  openModal: () => void;
  // Обрабатываем конструкцию: closeModal.
  closeModal: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useUpdater(): UseUpdaterResult {
  // Обрабатываем конструкцию: const transfer = useUpdateActions().
  const transfer = useUpdateActions();
  // Обрабатываем конструкцию: const library = useUpdateLibrary(transfer.check).
  const library = useUpdateLibrary(transfer.check);
  // Обрабатываем конструкцию: const { dismiss, openModal, closeModal } = useUpdateMod….
  const { dismiss, openModal, closeModal } = useUpdateModalControls();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useUpdateProgressListener.
  useUpdateProgressListener();
  // — разделитель логических блоков —

  // Возвращаем результат: { ...transfer, ...library, dismiss, openModal, closeMod….
  return {
    // Разворачиваем ...transfer в коллекцию.
    ...transfer,
    // Разворачиваем ...library в коллекцию.
    ...library,
    // Передаём поле dismiss в объект.
    dismiss,
    // Передаём поле openModal в объект.
    openModal,
    // Передаём поле closeModal в объект.
    closeModal,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
