// Импортируем зависимости из модуля @tauri-apps/plugin-dialog.
import { open as openDialog } from "@tauri-apps/plugin-dialog";
// Импортируем зависимости из модуля lucide-react.
import { FolderPlus } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui/Button.
import { Button } from "@/components/ui/Button";
// Импортируем зависимости из модуля @/components/ui/Modal.
import Modal from "@/components/ui/Modal";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameFoldersDialogProps {
  // Обрабатываем конструкцию: open.
  open: boolean;
  // Обрабатываем конструкцию: folders.
  folders: string[];
  // Обрабатываем конструкцию: scanning.
  scanning: boolean;
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Обрабатываем конструкцию: onAdd.
  onAdd: (folder: string) => Promise<void>;
  // Обрабатываем конструкцию: onRemove.
  onRemove: (folder: string) => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function GameFoldersDialog({
  // Обрабатываем конструкцию: open.
  open,
  // Обрабатываем конструкцию: folders.
  folders,
  // Обрабатываем конструкцию: scanning.
  scanning,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Обрабатываем конструкцию: onAdd.
  onAdd,
  // Обрабатываем конструкцию: onRemove.
  onRemove,
  // Закрываем текущий блок.
}: GameFoldersDialogProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const pick = async (): Promise<void> => { const selecte….
  const pick = async (): Promise<void> => {
    // Обрабатываем конструкцию: const selected = await openDialog({ directory: true, mu….
    const selected = await openDialog({ directory: true, multiple: false });
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: typeof selected === string.
    if (typeof selected === "string") {
      // Ожидаем завершение асинхронной операции await onAdd(selected).
      await onAdd(selected);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open={open} onClose={onClose} title={t(setting….
  return (
    // Обрабатываем конструкцию: <Modal open={open} onClose={onClose} title={t(settings.….
    <Modal
      // Обрабатываем конструкцию: open.
      open={open}
      // Обрабатываем конструкцию: onClose.
      onClose={onClose}
      // Обрабатываем конструкцию: title.
      title={t("settings.games.installed.folders.title")}
      // Обрабатываем конструкцию: description.
      description={t("settings.games.installed.folders.hint")}
      // Обрабатываем конструкцию: size.
      size="sm"
      // Обрабатываем конструкцию: footer.
      footer={
        // Обрабатываем конструкцию: <Button icon={<FolderPlus aria-hidden=true className=si….
        <Button
          // Обрабатываем конструкцию: icon.
          icon={<FolderPlus aria-hidden="true" className="size-4" />}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: void pick().
            void pick();
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.installed.folders.add")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        // Закрываем текущий блок.
      }
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {folders.length === 0 ? (
        // Обрабатываем конструкцию: <p className=text-text-tertiary text-sm>.
        <p className="text-text-tertiary text-sm">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.installed.folders.empty")}
          {/* Выводим текстовое содержимое в JSX. */}
        </p>
      ) : (
        // Продолжаем предыдущую конструкцию.
        // Закрываем выражение или список аргументов.
        // Обрабатываем конструкцию: <ul className=flex flex-col gap-1>.
        <ul className="flex flex-col gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          {folders.map((folder) => (
            // Обрабатываем конструкцию: <li key={folder} className=text-text-secondary flex ite….
            <li
              // Обрабатываем конструкцию: key.
              key={folder}
              // Обрабатываем конструкцию: className.
              className="text-text-secondary flex items-center justify-between gap-2 text-sm"
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <span className="truncate">{folder}</span>
              {/* Выводим текстовое содержимое в JSX. */}
              <Button
                // Обрабатываем конструкцию: size.
                size="sm"
                // Обрабатываем конструкцию: variant.
                variant="ghost"
                // Обрабатываем конструкцию: disabled.
                disabled={scanning}
                // Обрабатываем конструкцию: onClick.
                onClick={() => {
                  // Обрабатываем конструкцию: void onRemove(folder).
                  void onRemove(folder);
                  // Закрываем текущий блок.
                }}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {t("settings.games.installed.folders.remove")}
                {/* Выводим текстовое содержимое в JSX. */}
              </Button>
              {/* Выводим текстовое содержимое в JSX. */}
            </li>
            // Закрываем выражение или список аргументов.
          ))}
          {/* Выводим текстовое содержимое в JSX. */}
        </ul>
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
